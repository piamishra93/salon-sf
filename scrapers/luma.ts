import { createHash } from 'crypto'
import type { SalonEvent, EventCategory } from '../src/lib/types'

// Luma has a public API for city/geo-based event discovery
const LUMA_API = 'https://api.lu.ma/discover/get-paginated-events'

function makeId(lumaId: string): string {
  return createHash('md5').update(`luma:${lumaId}`).digest('hex').slice(0, 12)
}

function parseCategory(tags: string[]): EventCategory {
  const joined = tags.join(' ').toLowerCase()
  if (joined.includes('music') || joined.includes('concert')) return 'Music'
  if (joined.includes('film') || joined.includes('screen')) return 'Film'
  if (joined.includes('talk') || joined.includes('lecture') || joined.includes('panel')) return 'Talk'
  if (joined.includes('workshop') || joined.includes('class')) return 'Workshop'
  if (joined.includes('art') || joined.includes('gallery')) return 'Art'
  if (joined.includes('party') || joined.includes('social')) return 'Party'
  if (joined.includes('performance')) return 'Performance'
  return 'Other'
}

interface LumaEvent {
  api_id: string
  name: string
  start_at: string
  end_at?: string
  cover_url?: string
  description?: string
  url: string
  geo_address_info?: { full_address?: string; city?: string }
  tags?: string[]
}

interface LumaEntry {
  event: LumaEvent
  calendar?: { name?: string }
  hosts?: Array<{ name: string }>
  geo_address_info?: { full_address?: string }
}

interface LumaResponse {
  entries?: LumaEntry[]
  has_more?: boolean
  next_cursor?: string
}

export async function scrapeLuma(): Promise<SalonEvent[]> {
  const events: SalonEvent[] = []

  // Filter to San Francisco area events
  const params = new URLSearchParams({
    pagination_limit: '50',
    geo_latitude: '37.7749',
    geo_longitude: '-122.4194',
    geo_radius_km: '8',
    after: new Date().toISOString(),
  })

  const res = await fetch(`${LUMA_API}?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!res.ok) {
    console.warn(`Luma API returned ${res.status} — skipping`)
    return []
  }

  const data: LumaResponse = await res.json()

  for (const entry of data.entries ?? []) {
    const e = entry.event
    const start = new Date(e.start_at)
    const date = start.toISOString().slice(0, 10)
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    // venue: prefer calendar name (the organizer), fall back to first host
    const venue =
      entry.calendar?.name ??
      entry.hosts?.[0]?.name ??
      'TBD'

    // address: at entry level, not event level
    const address =
      entry.geo_address_info?.full_address ??
      e.geo_address_info?.full_address

    // skip events with a known non-SF address (match ", San Francisco, CA" to avoid "San Francisco Bay University" etc.)
    if (address && !address.includes(', San Francisco, CA')) continue

    events.push({
      id: makeId(e.api_id),
      title: e.name,
      date,
      startTime,
      endTime: e.end_at
        ? new Date(e.end_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : undefined,
      venue,
      address,
      source: 'luma',
      url: `https://lu.ma/${e.url}`,
      description: e.description,
      category: parseCategory(e.tags ?? []),
      imageUrl: e.cover_url,
    })
  }

  return events
}
