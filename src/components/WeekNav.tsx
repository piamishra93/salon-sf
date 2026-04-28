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
    <div className="flex items-center gap-6">
      <Link
        href={`/week/${prevWeek}`}
        className="text-neutral-400 hover:text-neutral-900 transition-colors text-sm"
      >
        ←
      </Link>
      <span className="text-sm font-medium tracking-wide uppercase text-neutral-500">
        {format(start, 'MMM d')}–{format(end, 'MMM d, yyyy')}
      </span>
      <Link
        href={`/week/${nextWeek}`}
        className="text-neutral-400 hover:text-neutral-900 transition-colors text-sm"
      >
        →
      </Link>
    </div>
  )
}
