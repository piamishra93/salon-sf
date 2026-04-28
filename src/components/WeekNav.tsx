import Link from 'next/link'
import { format, addWeeks, subWeeks, parseISO } from 'date-fns'

interface WeekNavProps {
  weekStart: string
}

export default function WeekNav({ weekStart }: WeekNavProps) {
  const start = parseISO(weekStart)
  const end = addWeeks(start, 1)

  const prevWeek = format(subWeeks(start, 1), 'yyyy-MM-dd')
  const nextWeek = format(addWeeks(start, 1), 'yyyy-MM-dd')

  return (
    <div className="flex items-center gap-8">
      <Link
        href={`/week/${prevWeek}`}
        className="text-stone-300 hover:text-stone-900 transition-colors text-base leading-none"
        aria-label="Previous week"
      >
        ←
      </Link>
      <span className="text-xs tracking-[0.15em] uppercase text-stone-400 select-none">
        {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')}
      </span>
      <Link
        href={`/week/${nextWeek}`}
        className="text-stone-300 hover:text-stone-900 transition-colors text-base leading-none"
        aria-label="Next week"
      >
        →
      </Link>
    </div>
  )
}
