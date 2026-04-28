import * as cheerio from 'cheerio'
import { createHash } from 'crypto'
import type { SalonEvent, EventCategory } from '../src/lib/types'

const BASE_URL = 'https://www.sfmoma.org'

function makeId(title: string, date: string): string {
  return createHash('md5').update(`sfmoma:${title}:${date}`).digest('hex').slice(0, 12)
}

function parseCategory(type: string): EventCategory {
  const t = type.toLowerCase()
  if (t.includes('film') || t.includes('screen')) return 'Film'
  if (t.includes('talk') || t.includes('lecture') || t.includes('panel')) return 'Talk'
  if (t.includes('tour')) return 'Tour' as EventCategory
  if (t.includes('workshop')) return 'Workshop'
  if (t.includes('performance')) return 'Performance'
  if (t.includes('party') || t.includes('bash') || t.includes('gala')) return 'Party'
  return 'Art'
}

// Parses "Wednesday, Apr 29, 2026" or "Wednesday, Apr 29, 2026 | 6 p.m."
function parseDateTime(raw: string): { date: string; startTime: string } | null {
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }

  const match = raw.match(/(\w+)\s+(\d+),\s+(\d{4})/)
  if (!match) return null

  const m = months[match[1]]
  if (!m) return null
  const date = `${match[3]}-${m}-${match[2].padStart(2, '0')}`

  const timeMatch = raw.match(/\|\s*(\d+)(?::(\d+))?\s*([ap])\.m\./i)
  const startTime = timeMatch
    ? `${timeMatch[1]}:${timeMatch[2] ?? '00'} ${timeMatch[3].toUpperCase()}M`
    : '12:00 PM'

  return { date, startTime }
}

export async function scrapeSFMOMA(): Promise<SalonEvent[]> {
  const res = await fetch(`${BASE_URL}/events/`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`SFMOMA fetch failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const events: SalonEvent[] = []

  $('div.archive--grid-wrapper-grid-item').each((_, el) => {
    const $el = $(el)

    const title = $el.find('h4.archive--grid-wrapper-grid-item-text-title').text().trim()
    const subtitle = $el.find('div.archive--grid-wrapper-grid-item-text-subtitle').text().trim()
    const typeRaw = $el.find('span.archive--grid-wrapper-grid-item-text-supertitle').text().trim()
    const href = $el.find('a.archive--grid-wrapper-grid-item-link').attr('href') ?? ''
    const imageUrl = $el.find('img').first().attr('src')

    if (!title || !subtitle) return

    const parsed = parseDateTime(subtitle)
    if (!parsed) return

    events.push({
      id: makeId(title, parsed.date),
      title,
      date: parsed.date,
      startTime: parsed.startTime,
      venue: 'SFMOMA',
      address: '151 Third St, San Francisco, CA',
      source: 'sfmoma',
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      category: parseCategory(typeRaw),
      imageUrl: imageUrl ?? undefined,
    })
  })

  return events
}
