'use client'

import type { SalonEvent, EventCategory } from '@/lib/types'

const SOURCE_LABELS: Record<string, string> = {
  sfmoma: 'SFMOMA',
  famsf: 'FAMSF',
  msp: 'Minnesota St Project',
  citylights: 'City Lights',
  luma: 'Luma',
  partiful: 'Partiful',
}

const CATEGORY_DOTS: Record<EventCategory, string> = {
  Art:         '#c9b8a8',
  Film:        '#a8b8c9',
  Music:       '#a8c9b0',
  Talk:        '#c9c4a8',
  Workshop:    '#b8a8c9',
  Performance: '#c9a8b8',
  Party:       '#c9b0a8',
  Other:       '#d4d0cc',
}

interface EventCardProps {
  event: SalonEvent
}

export default function EventCard({ event }: EventCardProps) {
  const dot = CATEGORY_DOTS[event.category] ?? CATEGORY_DOTS.Other

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-stone-100 pb-3 last:border-b-0"
    >
      {/* Time + category dot */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] tracking-[0.15em] uppercase text-stone-400">
          {event.startTime}
        </span>
        <span
          className="w-[5px] h-[5px] rounded-full shrink-0"
          style={{ background: dot }}
        />
      </div>

      {/* Title */}
      <div className="font-serif text-[14px] leading-snug text-stone-900 group-hover:text-stone-500 transition-colors duration-150">
        {event.isPick && <span className="mr-1 text-stone-300">*</span>}
        {event.title}
      </div>

      {/* Venue + description — hidden at rest, revealed on hover */}
      <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-300 ease-in-out">
        <div className="text-[10px] text-stone-400 mt-1.5">
          {event.venue}{SOURCE_LABELS[event.source] ? ` · ${SOURCE_LABELS[event.source]}` : ''}
        </div>
        {event.description && (
          <p className="text-[10px] text-stone-400 mt-0.5 italic leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </a>
  )
}
