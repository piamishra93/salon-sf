import { redirect } from 'next/navigation'
import { getWeekStart, DEFAULT_FILTER } from '@/lib/events'

export default function Home() {
  const weekStart = getWeekStart()
  redirect(`/week/${weekStart}?filter=${DEFAULT_FILTER}`)
}
