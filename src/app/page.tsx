import { redirect } from 'next/navigation'
import { getWeekStart } from '@/lib/events'
import { format } from 'date-fns'

export default function Home() {
  const weekStart = getWeekStart()
  const today = format(new Date(), 'yyyy-MM-dd')
  redirect(`/week/${weekStart}?day=${today}`)
}
