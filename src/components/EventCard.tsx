import type { SalonEvent } from '@/lib/types'

const SOURCE_LABELS: Record<string, string> = {
  sfmoma: 'SFMOMA',
  famsf: 'FAMSF',
  citylights: 'City Lights',
  luma: 'Luma',
  partiful: 'Partiful',
}

interface EventCardProps {
  event: SalonEvent
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 py-4 border-b border-neutral-100 hover:bg-neutral-50 -mx-4 px-4 transition-colors"
    >
      <div className="w-16 shrink-0 text-right">
        <span className="text-sm text-neutral-400">{event.startTime}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors leading-snug">
              {event.isPick && (
                <span className="inline-block mr-1.5 text-amber-500">★</span>
              )}
              {event.title}
            </h3>
            <p className="text-sm text-neutral-500 mt-0.5">{event.venue}</p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
              {event.category}
            </span>
            <span className="text-xs text-neutral-300">
              {SOURCE_LABELS[event.source] ?? event.source}
            </span>
          </div>
        </div>

        {event.description && (
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </a>
  )
}
