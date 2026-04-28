import { startOfWeek, addDays, format, parseISO } from 'date-fns'
import type { SalonEvent } from './types'

export type Filter = 'art' | 'startup' | 'books'

export const FILTERS: { id: Filter; label: string }[] = [
  { id: 'art', label: 'art + design' },
  { id: 'startup', label: 'startups' },
  { id: 'books', label: 'books' },
]

export const DEFAULT_FILTER: Filter = 'art'

function matchesFilter(event: SalonEvent, filter: Filter): boolean {
  const text = `${event.title} ${event.description ?? ''} ${event.venue}`.toLowerCase()

  if (filter === 'art') {
    if (['sfmoma', 'famsf'].includes(event.source)) return true
    if (['Art', 'Film', 'Music', 'Performance', 'Exhibition'].includes(event.category)) return true
    if (/\b(art|design|gallery|exhibition|film|screening|photography|ceramics|print|studio|workshop|music|concert|performance|theater|theatre|dance)\b/.test(text)) return true
    return false
  }

  if (filter === 'books') {
    if (event.source === 'citylights') return true
    if (/\b(book|books|reading|author|poetry|poet|literary|literature|fiction|novel|essay|publish|writing|writer)\b/.test(text)) return true
    return false
  }

  if (filter === 'startup') {
    if (/\b(startup|founder|investor|venture|vc|fundrais|pitch|saas|accelerator|incubator|product|ai\b|llm|tech talk|demo day|networking|angel|series [abc])\b/.test(text)) return true
    return false
  }

  return false
}

export function getEvents(): SalonEvent[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../data/events.json') as SalonEvent[]
  } catch {
    return []
  }
}

export function getWeekDays(weekStart: string): Date[] {
  const start = parseISO(weekStart)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function getWeekStart(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date()
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

export function getEventsForDay(events: SalonEvent[], date: string): SalonEvent[] {
  return events.filter(e => e.date === date)
}

export function filterEvents(events: SalonEvent[], filter: Filter): SalonEvent[] {
  return events.filter(e => matchesFilter(e, filter))
}

export function groupEventsByDay(events: SalonEvent[], weekStart: string): Record<string, SalonEvent[]> {
  const days = getWeekDays(weekStart)
  const result: Record<string, SalonEvent[]> = {}
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd')
    result[key] = getEventsForDay(events, key)
  }
  return result
}
