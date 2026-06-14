import Image from 'next/image'

type ImageMedia = { urlOriginal: string; altText: string; focalX: number; focalY: number } | null
type Settings = { aboutTitle?: string | null; aboutText?: string | null; aboutImage?: ImageMedia } | null

export default function AboutSection({ settings }: { settings: Settings }) {
  const title = settings?.aboutTitle || 'About Us'
  const text  = settings?.aboutText  || ''
  const img   = settings?.aboutImage ?? null

  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Our Story</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-8">{title}</h2>
            {text ? (
              <div className="rich-text text-muted leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: text }} />
            ) : (
              <p className="text-muted leading-relaxed text-lg">
                Poppy and Charlie are a sibling acoustic duo performing a blend of covers and original material.
                Available for weddings, private events, and venues.
              </p>
            )}
          </div>

          <div className="order-first md:order-last">
            {img ? (
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={img.urlOriginal}
                  alt={img.altText}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }}
                />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-surface border border-border flex items-center justify-center">
                <p className="text-muted text-sm text-center px-8">Add a photo in Admin → Site Settings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
