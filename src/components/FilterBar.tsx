import Link from 'next/link'
import { FILTERS, type Filter } from '@/lib/events'

interface FilterBarProps {
  weekStart: string
  activeFilter: Filter
}

export default function FilterBar({ weekStart, activeFilter }: FilterBarProps) {
  return (
    <div className="flex items-center gap-7">
      {FILTERS.map(({ id, label }) => (
        <Link
          key={id}
          href={`/week/${weekStart}?filter=${id}`}
          className={`text-[11px] tracking-[0.14em] uppercase transition-colors ${
            activeFilter === id
              ? 'text-stone-900'
              : 'text-stone-300 hover:text-stone-500'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
