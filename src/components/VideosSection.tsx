import type { Video } from '@prisma/client'
import { getYouTubeEmbedUrl } from '@/lib/youtube'

export default function VideosSection({ videos }: { videos: Video[] }) {
  if (!videos.length) return null

  return (
    <section id="videos" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Watch &amp; Listen</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Videos</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map(video => {
            const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl)
            if (!embedUrl) return null
            return (
              <div key={video.id} className="group">
                <div className="relative aspect-video bg-background overflow-hidden mb-4">
                  <iframe
                    src={`${embedUrl}?modestbranding=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{video.title}</h3>
                {video.description && <p className="text-sm text-muted">{video.description}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
