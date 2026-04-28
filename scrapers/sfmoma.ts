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
  if (t.includes('tour')) return 'Tour'
  if (t.includes('workshop')) return 'Workshop'
  if (t.includes('performance')) return 'Performance'
  if (t.includes('party') || t.includes('bash') || t.includes('gala')) return 'Party'
  return 'Art'
}

// Parses "Thursday, Apr 30, 2026 | 6 p.m." into { date, startTime }
function parseDateTime(raw: string): { date: string; startTime: string } | null {
  const match = raw.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+)\s*\|\s*([\d:]+\s*[ap]\.m\.)/i)
  if (!match) return null

  const [, , month, day, year, time] = match
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }
  const m = months[month]
  if (!m) return null

  const date = `${year}-${m}-${day.padStart(2, '0')}`
  const startTime = time.replace(/\./g, '').replace('am', 'AM').replace('pm', 'PM').trim()
  return { date, startTime }
}

export async function scrapeSFMOMA(): Promise<SalonEvent[]> {
  const res = await fetch(`${BASE_URL}/events/`)
  if (!res.ok) throw new Error(`SFMOMA fetch failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const events: SalonEvent[] = []

  // Each event card is an <a> linking to /program/...
  $('a[href^="/program/"]').each((_, el) => {
    const $el = $(el)
    const title = $el.find('h2, h3, h4, .event-title, [class*="title"]').first().text().trim()
    const dateRaw = $el.find('[class*="date"], time').first().text().trim()
    const categoryRaw = $el.find('[class*="type"], [class*="category"], [class*="label"]').first().text().trim()
    const href = $el.attr('href') ?? ''
    const imageUrl = $el.find('img').first().attr('src')

    if (!title || !dateRaw) return

    const parsed = parseDateTime(dateRaw)
    if (!parsed) return

    events.push({
      id: makeId(title, parsed.date),
      title,
      date: parsed.date,
      startTime: parsed.startTime,
      venue: 'SFMOMA',
      address: '151 Third St, San Francisco',
      source: 'sfmoma',
      url: `${BASE_URL}${href}`,
      category: parseCategory(categoryRaw),
      imageUrl: imageUrl ?? undefined,
    })
  })

  return events
}
