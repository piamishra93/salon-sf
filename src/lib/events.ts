import { startOfWeek, addDays, format, parseISO } from 'date-fns'
import type { SalonEvent } from './types'

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

export function groupEventsByDay(events: SalonEvent[], weekStart: string): Record<string, SalonEvent[]> {
  const days = getWeekDays(weekStart)
  const result: Record<string, SalonEvent[]> = {}
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd')
    result[key] = getEventsForDay(events, key)
  }
  return result
}
