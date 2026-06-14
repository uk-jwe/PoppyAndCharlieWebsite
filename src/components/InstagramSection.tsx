'use client'
import Script from 'next/script'

type Settings = { beholdWidgetId?: string | null } | null

export default function InstagramSection({ settings }: { settings: Settings }) {
  const widgetId = settings?.beholdWidgetId
  if (!widgetId) return null

  return (
    <section id="instagram" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Follow Along</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            @poppyandcharliemusic
          </h2>
          <a href="https://www.instagram.com/poppyandcharliemusic/" target="_blank" rel="noopener noreferrer"
            className="text-sm text-muted hover:text-accent transition-colors">
            View on Instagram →
          </a>
        </div>
        <div id={`behold-widget-${widgetId}`} />
        <Script id="behold-init" strategy="lazyOnload">{`
          window.behold = window.behold || function(){ (behold.q = behold.q || []).push(arguments) };
          behold('init', { widgetId: '${widgetId}' });
        `}</Script>
        <Script src="https://cdn.behold.so/widget.js" strategy="lazyOnload" />
      </div>
    </section>
  )
}
