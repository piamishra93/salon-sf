import Image from 'next/image'

const PANELS = [
  { src: '/art/diebenkorn-op54.jpg',       alt: 'Richard Diebenkorn, Ocean Park #54, 1972',       position: 'top center' },
  { src: '/art/diebenkorn-op79.jpg',        alt: 'Richard Diebenkorn, Ocean Park #79, 1975',        position: 'top center' },
  { src: '/art/diebenkorn-oceanpark.jpg',   alt: 'Richard Diebenkorn, Ocean Park Series',            position: 'top center' },
  { src: '/art/diebenkorn-db.png',          alt: 'Richard Diebenkorn, Ocean Park Series',            position: 'center center' },
]

export default function ArtBanner() {
  return (
    <div>
      {/* Full-bleed strip — intentionally breaks the mx-12 margin */}
      <div className="relative w-full overflow-hidden" style={{ height: '220px' }}>
        <Image
          src="/art/diebenkorn-op54.jpg"
          alt="Richard Diebenkorn, Ocean Park #54, 1972"
          fill
          style={{ objectFit: 'cover', objectPosition: 'top center' }}
          sizes="100vw"
          priority={false}
        />
      </div>
    </div>
  )
}
