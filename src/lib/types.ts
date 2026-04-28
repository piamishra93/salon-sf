export type EventSource = 'luma' | 'partiful' | 'sfmoma' | 'famsf' | 'citylights' | 'msp'

export type EventCategory =
  | 'Art'
  | 'Film'
  | 'Music'
  | 'Talk'
  | 'Performance'
  | 'Workshop'
  | 'Tour'
  | 'Party'
  | 'Other'

export interface SalonEvent {
  id: string
  title: string
  date: string       // YYYY-MM-DD
  startTime: string  // "7:00 PM"
  endTime?: string
  venue: string
  address?: string
  source: EventSource
  url: string
  description?: string
  category: EventCategory
  imageUrl?: string
  isPick?: boolean   // curator's pick
}
