import { format } from 'date-fns'
import { getEvents, getWeekStart, getWeekDays, groupEventsByDay, filterEvents, DEFAULT_FILTER, type Filter } from '@/lib/events'
import WeekNav from '@/components/WeekNav'
import FilterBar from '@/components/FilterBar'
import EventCard from '@/components/EventCard'
import ArtBanner from '@/components/ArtBanner'

interface PageProps {
  params: Promise<{ date: string }>
  searchParams: Promise<{ filter?: string }>
}

export default async function WeekPage({ params, searchParams }: PageProps) {
  const { date } = await params
  const { filter: filterParam } = await searchParams

  const weekStart = getWeekStart(date)
  const activeFilter = (['art', 'startup', 'books'].includes(filterParam ?? '')
    ? filterParam
    : DEFAULT_FILTER) as Filter

  const allEvents = getEvents()
  const filtered = filterEvents(allEvents, activeFilter)
  const days = getWeekDays(weekStart)
  const grouped = groupEventsByDay(filtered, weekStart)

  const daysWithEvents = days
    .map(d => format(d, 'yyyy-MM-dd'))
    .filter(d => (grouped[d]?.length ?? 0) > 0)

  return (
    <div className="min-h-screen flex flex-col" style={{ minWidth: '900px' }}>

      {/* Header */}
      <header className="px-12 pt-10 pb-0" style={{ borderBottom: '2px solid white' }}>
        <div className="flex items-baseline justify-between pb-5">
          <h1 className="font-serif text-xl font-light tracking-[0.14em] uppercase text-stone-900">
            Salon SF
          </h1>
          <WeekNav weekStart={weekStart} />
        </div>
        <div className="pb-4">
          <FilterBar weekStart={weekStart} activeFilter={activeFilter} />
        </div>
      </header>

      {/* Week grid */}
      <div className="flex-1 mx-12 mt-8 grid grid-cols-7" style={{ borderBottom: '2px solid white' }}>
        {days.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayEvents = grouped[dateKey] ?? []
          const isLast = i === 6

          return (
            <div
              key={dateKey}
              className="flex flex-col"
              style={!isLast ? { borderRight: '2px solid white' } : undefined}
            >
              <div className="px-4 pt-5 pb-4" style={{ borderBottom: '2px solid white' }}>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-stone-900 font-medium">
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-[10px] tracking-wide text-stone-400">
                    {format(day, 'd')}
                  </span>
                </div>
              </div>

              <div className="flex-1 px-4 py-5 space-y-5">
                {dayEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Art banner — flush to bottom */}
      <div className="mt-10">
        <ArtBanner />
      </div>

    </div>
  )
}
