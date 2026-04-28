import * as cheerio from 'cheerio'
import { createHash } from 'crypto'
import type { SalonEvent, EventCategory } from '../src/lib/types'

const BASE_URL = 'https://www.famsf.org'

function makeId(title: string, date: string): string {
  return createHash('md5').update(`famsf:${title}:${date}`).digest('hex').slice(0, 12)
}

function parseCategory(tags: string): EventCategory {
  const t = tags.toLowerCase()
  if (t.includes('film') || t.includes('screen')) return 'Film'
  if (t.includes('talk') || t.includes('lecture')) return 'Talk'
  if (t.includes('tour')) return 'Tour'
  if (t.includes('workshop')) return 'Workshop'
  if (t.includes('party')) return 'Party'
  if (t.includes('performance')) return 'Performance'
  return 'Art'
}

// Parses various FAMSF date formats into YYYY-MM-DD
function parseDate(raw: string): string | null {
  // "Apr 30, 2026" or "April 30, 2026"
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

export async function scrapeFAMSF(): Promise<SalonEvent[]> {
  const res = await fetch(`${BASE_URL}/calendar`)
  if (!res.ok) throw new Error(`FAMSF fetch failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const events: SalonEvent[] = []

  // Event cards — FAMSF uses <a> cards linking to /events/...
  $('a[href*="/events/"]').each((_, el) => {
    const $el = $(el)
    const title = $el.find('h2, h3, h4, [class*="title"]').first().text().trim()
    const dateRaw = $el.find('time, [class*="date"]').first().text().trim()
    const locationRaw = $el.find('[class*="location"], [class*="museum"], [class*="venue"]').first().text().trim()
    const tagsRaw = $el.find('[class*="tag"], [class*="category"], [class*="type"]').text().trim()
    const timeRaw = $el.find('[class*="time"]').first().text().trim()
    const href = $el.attr('href') ?? ''
    const imageUrl = $el.find('img').first().attr('src')

    if (!title || !dateRaw) return

    const date = parseDate(dateRaw)
    if (!date) return

    const venue = locationRaw.includes('Legion') ? 'Legion of Honor' : 'de Young Museum'
    const address = locationRaw.includes('Legion')
      ? '100 34th Ave, San Francisco'
      : '50 Hagiwara Tea Garden Dr, San Francisco'

    events.push({
      id: makeId(title, date),
      title,
      date,
      startTime: timeRaw || '11:00 AM',
      venue,
      address,
      source: 'famsf',
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      category: parseCategory(tagsRaw),
      imageUrl: imageUrl ?? undefined,
    })
  })

  return events
}
