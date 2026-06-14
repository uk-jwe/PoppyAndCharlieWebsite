import Image from 'next/image'

type ImageMedia = { urlOriginal: string; altText: string; focalX: number; focalY: number } | null
type Settings = { heroTitle?: string | null; heroSubtitle?: string | null; heroTagline?: string | null; heroImage?: ImageMedia } | null

export default function HeroSection({ settings }: { settings: Settings }) {
  const title    = settings?.heroTitle    || 'Poppy & Charlie'
  const subtitle = settings?.heroSubtitle || 'Acoustic Duo'
  const tagline  = settings?.heroTagline  || ''
  const img      = settings?.heroImage ?? null
  const textColor  = img ? 'text-white'      : 'text-foreground'
  const mutedColor = img ? 'text-white/80'   : 'text-muted'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16">
      {/* Hero image via next/image — serves optimised WebP at each breakpoint */}
      {img && (
        <>
          <Image
            src={img.urlOriginal}
            alt={img.altText}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      {!img && (
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 60% 40%, var(--color-accent) 0%, transparent 70%)' }} />
      )}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className={`text-xs uppercase tracking-[0.3em] font-body mb-6 ${mutedColor}`}>
          {subtitle}
        </p>
        <h1 className={`text-6xl md:text-8xl font-heading font-bold tracking-tight mb-6 ${textColor}`}>
          {title}
        </h1>
        {tagline && (
          <p className={`text-base md:text-xl mb-12 max-w-2xl mx-auto font-body ${mutedColor}`}>
            {tagline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#contact"
            className="inline-block px-8 py-4 text-xs uppercase tracking-widest font-bold transition-colors bg-accent text-white hover:bg-accent-dark">
            Book Us
          </a>
          <a href="#videos"
            className={`inline-block px-8 py-4 text-xs uppercase tracking-widest font-bold border transition-colors ${
              img ? 'border-white text-white hover:bg-white hover:text-foreground'
                  : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
            Watch &amp; Listen
          </a>
        </div>
      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${mutedColor}`}>
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce">
          <path d="M10 4v12M4 10l6 6 6-6" />
        </svg>
      </div>
    </section>
  )
}
