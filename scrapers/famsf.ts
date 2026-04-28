import * as cheerio from 'cheerio'
import { createHash } from 'crypto'
import type { SalonEvent, EventCategory } from '../src/lib/types'

const BASE_URL = 'https://www.famsf.org'

function makeId(title: string, href: string): string {
  return createHash('md5').update(`famsf:${title}:${href}`).digest('hex').slice(0, 12)
}

function parseCategory(tags: string): EventCategory {
  const t = tags.toLowerCase()
  if (t.includes('film') || t.includes('screen')) return 'Film'
  if (t.includes('talk') || t.includes('lecture')) return 'Talk'
  if (t.includes('workshop')) return 'Workshop'
  if (t.includes('party') || t.includes('social')) return 'Party'
  if (t.includes('performance') || t.includes('concert')) return 'Performance'
  if (t.includes('tour')) return 'Tour' as EventCategory
  return 'Art'
}

// FAMSF shows recurring events like "Tues–Sun" and one-off events with specific dates.
// Tries to extract a usable date from time text; falls back to today + offset.
function parseTimeText(raw: string): string {
  const clean = raw.replace(/\\/g, '').trim()
  // Look for a specific date like "Apr 30" or "May 1"
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }
  const match = clean.match(/([A-Z][a-z]+)\s+(\d+)/)
  if (match && months[match[1]]) {
    const year = new Date().getFullYear()
    return `${year}-${months[match[1]]}-${match[2].padStart(2, '0')}`
  }
  return ''
}

function parseStartTime(raw: string): string {
  const match = raw.match(/(\d+)(?::(\d+))?\s*(am|pm)/i)
  if (!match) return '11:00 AM'
  const [, hour, min, meridiem] = match
  return `${hour}:${min ?? '00'} ${meridiem.toUpperCase()}`
}

export async function scrapeFAMSF(): Promise<SalonEvent[]> {
  const res = await fetch(`${BASE_URL}/calendar`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`FAMSF fetch failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const events: SalonEvent[] = []
  const seen = new Set<string>()

  $('li').each((_, el) => {
    const $el = $(el)

    const $link = $el.find('a[data-BlockLink-target]')
    if (!$link.length) return

    const title = $link.text().trim()
    const href = $link.attr('href') ?? ''
    if (!title || !href || seen.has(href)) return
    seen.add(href)

    const timeText = $el.find('p.f-body-1').first().text().trim()
    const locationText = $el.find('div').filter((_, d) => {
      return $(d).find('span').length > 0 && $(d).text().includes('Young') || $(d).text().includes('Legion')
    }).first().text().trim()

    const tagsText = $el.text()
    const imageUrl = $el.find('img').first().attr('src')

    const date = parseTimeText(timeText)
    if (!date) return

    const venue = locationText.toLowerCase().includes('legion') ? 'Legion of Honor' : 'de Young Museum'
    const address = locationText.toLowerCase().includes('legion')
      ? '100 34th Ave, San Francisco, CA'
      : '50 Hagiwara Tea Garden Dr, San Francisco, CA'

    events.push({
      id: makeId(title, href),
      title,
      date,
      startTime: parseStartTime(timeText),
      venue,
      address,
      source: 'famsf',
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      category: parseCategory(tagsText),
      imageUrl: imageUrl ?? undefined,
    })
  })

  return events
}
