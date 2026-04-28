import * as cheerio from 'cheerio'
import { createHash } from 'crypto'
import type { SalonEvent } from '../src/lib/types'

const BASE_URL = 'https://citylights.com'

function makeId(title: string, date: string): string {
  return createHash('md5').update(`citylights:${title}:${date}`).digest('hex').slice(0, 12)
}

function parseDate(raw: string): string | null {
  const match = raw.match(/(\w+)\s+(\d+),?\s+(\d{4})/)
  if (!match) return null

  const months: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }
  const m = months[match[1]]
  if (!m) return null
  return `${match[3]}-${m}-${match[2].padStart(2, '0')}`
}

export async function scrapeCityLights(): Promise<SalonEvent[]> {
  const res = await fetch(`${BASE_URL}/events`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    redirect: 'follow',
  })

  if (!res.ok) {
    console.warn(`City Lights fetch failed: ${res.status} — skipping`)
    return []
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const events: SalonEvent[] = []

  // City Lights uses WordPress/Squarespace — event cards typically inside article or .eventlist-event
  $('[class*="event"], article').each((_, el) => {
    const $el = $(el)
    const title = $el.find('h2, h3, [class*="title"], [class*="name"]').first().text().trim()
    const dateRaw = $el.find('time, [class*="date"], [class*="datetime"]').first().text().trim()
    const timeRaw = $el.find('[class*="time"]').first().text().trim()
    const href = $el.find('a').first().attr('href') ?? ''

    if (!title || !dateRaw) return

    const date = parseDate(dateRaw)
    if (!date) return

    events.push({
      id: makeId(title, date),
      title,
      date,
      startTime: timeRaw || '7:00 PM',
      venue: 'City Lights Bookstore',
      address: '261 Columbus Ave, San Francisco',
      source: 'citylights',
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      category: 'Talk',
    })
  })

  return events
}
