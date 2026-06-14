import Image from 'next/image'
import type { Photo, Media } from '@prisma/client'

type PhotoWithMedia = Photo & { media: Media }

export default function GallerySection({ photos }: { photos: PhotoWithMedia[] }) {
  if (!photos.length) return null

  return (
    <section id="gallery" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Moments</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Gallery</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => {
            const src = photo.media.urlCard ?? photo.media.urlOriginal
            const isFeature = i === 0
            return (
              <div key={photo.id}
                className={`group relative overflow-hidden bg-background ${isFeature ? 'col-span-2 row-span-2' : ''}`}>
                <div className="relative aspect-square">
                  <Image
                    src={src}
                    alt={photo.media.altText || photo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={isFeature
                      ? '(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw'
                      : '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'}
                    style={{ objectPosition: `${photo.media.focalX}% ${photo.media.focalY}%` }}
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                      <p className="text-white text-sm px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
