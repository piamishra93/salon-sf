import { format, parseISO } from 'date-fns'
import { notFound } from 'next/navigation'
import { getEvents, getWeekStart, getWeekDays, groupEventsByDay } from '@/lib/events'
import WeekNav from '@/components/WeekNav'
import DayNav from '@/components/DayNav'
import EventCard from '@/components/EventCard'

interface PageProps {
  params: Promise<{ date: string }>
  searchParams: Promise<{ day?: string }>
}

export default async function WeekPage({ params, searchParams }: PageProps) {
  const { date } = await params
  const { day } = await searchParams

  const weekStart = getWeekStart(date)
  if (weekStart !== date) {
    // If date is not a Monday, redirect would be ideal — for now just use correct weekStart
  }

  const events = getEvents()
  const days = getWeekDays(weekStart)
  const grouped = groupEventsByDay(events, weekStart)

  const dayKeys = days.map(d => format(d, 'yyyy-MM-dd'))
  const activeDay = day && dayKeys.includes(day) ? day : dayKeys[0]

  const activeDayEvents = grouped[activeDay] ?? []

  const dayNavData = dayKeys.map(d => ({
    date: d,
    count: grouped[d]?.length ?? 0,
  }))

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 mb-1">
            Salon SF
          </h1>
          <p className="text-sm text-neutral-400">
            What&apos;s happening in San Francisco
          </p>
        </div>

        {/* Week navigation */}
        <div className="mb-6">
          <WeekNav weekStart={weekStart} />
        </div>

        {/* Day tabs */}
        <div className="mb-8">
          <DayNav weekStart={weekStart} days={dayNavData} activeDay={activeDay} />
        </div>

        {/* Event list */}
        <div>
          {activeDayEvents.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">
              No events found for {format(parseISO(activeDay), 'EEEE, MMMM d')}.
            </p>
          ) : (
            <>
              <p className="text-xs text-neutral-400 mb-4 uppercase tracking-wider">
                {format(parseISO(activeDay), 'EEEE, MMMM d')} · {activeDayEvents.length} events
              </p>
              {activeDayEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
