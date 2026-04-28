import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface DayNavProps {
  weekStart: string
  days: Array<{ date: string; count: number }>
  activeDay: string
}

export default function DayNav({ weekStart, days, activeDay }: DayNavProps) {
  return (
    <div className="flex gap-1">
      {days.map(({ date, count }) => {
        const d = parseISO(date)
        const dayLabel = format(d, 'EEE')
        const dayNum = format(d, 'd')
        const isActive = date === activeDay

        return (
          <Link
            key={date}
            href={`/week/${weekStart}?day=${date}`}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-[52px] ${
              isActive
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <span className="text-xs font-medium uppercase tracking-wider">{dayLabel}</span>
            <span className="text-sm font-semibold">{dayNum}</span>
            {count > 0 && (
              <span className={`text-xs mt-0.5 ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
