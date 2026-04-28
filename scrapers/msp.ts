import * as cheerio from 'cheerio'
import { createHash } from 'crypto'
import type { SalonEvent, EventCategory } from '../src/lib/types'

const BASE_URL = 'https://minnesotastreetproject.com'

function makeId(href: string): string {
  return createHash('md5').update(`msp:${href}`).digest('hex').slice(0, 12)
}

function parseCategory(type: string): EventCategory {
  const t = type.toLowerCase()
  if (t.includes('lecture') || t.includes('talk') || t.includes('panel') || t.includes('conversation')) return 'Talk'
  if (t.includes('performance') || t.includes('concert')) return 'Performance'
  if (t.includes('workshop') || t.includes('class')) return 'Workshop'
  if (t.includes('film') || t.includes('screen')) return 'Film'
  if (t.includes('party') || t.includes('reception') || t.includes('opening')) return 'Party'
  return 'Art'
}

// Parses "Sat, May 2, 4PM-7PM" → { date, startTime, endTime }
function parseDateTime(raw: string): { date: string; startTime: string; endTime?: string } | null {
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }

  const match = raw.match(/(\w+)\s+(\d+),\s+(\d+)(?::(\d+))?(AM|PM)(?:-(\d+)(?::(\d+))?(AM|PM))?/i)
  if (!match) return null

  const [, month, day, startHour, startMin, startMeridiem, endHour, endMin, endMeridiem] = match
  const m = months[month]
  if (!m) return null

  const now = new Date()
  let year = now.getFullYear()
  const candidateDate = new Date(`${year}-${m}-${day.padStart(2, '0')}`)
  if (candidateDate < now) year += 1

  const date = `${year}-${m}-${day.padStart(2, '0')}`
  const startTime = `${startHour}:${startMin ?? '00'} ${startMeridiem.toUpperCase()}`
  const endTime = endHour ? `${endHour}:${endMin ?? '00'} ${(endMeridiem ?? startMeridiem).toUpperCase()}` : undefined

  return { date, startTime, endTime }
}

export async function scrapeMSP(): Promise<SalonEvent[]> {
  const res = await fetch(`${BASE_URL}/events/all`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  if (!res.ok) throw new Error(`MSP fetch failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const events: SalonEvent[] = []
  const seen = new Set<string>()

  $('div.event-row').each((_, el) => {
    const $el = $(el)

    // Date + location are in the hidden-xs column; <br> tags separate fields
    const $meta = $el.find('div.font-small.hidden-xs')
    const metaHtml = $meta.html() ?? ''
    const lines = metaHtml.split(/<br\s*\/?>/).map(l => cheerio.load(l).text().trim()).filter(Boolean)
    const dateRaw = lines[0] ?? ''
    const gallery = lines[2] ?? 'Minnesota Street Project'

    // Title + link — appears twice (visible-sm + hidden-sm), grab first unique href
    const $link = $el.find('h3.font-large a').first()
    const title = $link.text().trim()
    const href = $link.attr('href') ?? ''

    if (!title || !href || seen.has(href)) return
    seen.add(href)

    const parsed = parseDateTime(dateRaw)
    if (!parsed) return

    const typeRaw = $el.find('p.font-small.highlight').first().text().trim()
    const imageUrl = $el.find('img').first().attr('src')

    events.push({
      id: makeId(href),
      title,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      venue: gallery,
      address: '1275 Minnesota St, San Francisco, CA',
      source: 'msp',
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      category: parseCategory(typeRaw),
      imageUrl: imageUrl ? `${BASE_URL}${imageUrl}` : undefined,
    })
  })

  return events
}
