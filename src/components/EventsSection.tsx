import type { Event } from '@prisma/client'

function formatDate(date: Date) {
  return {
    day:   date.toLocaleDateString('en-GB', { day: 'numeric' }),
    month: date.toLocaleDateString('en-GB', { month: 'short' }),
    year:  date.getFullYear(),
    time:  date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

const STATUS_STYLES: Record<string, string> = {
  upcoming:  'bg-accent/10 text-accent border-accent/30',
  'sold-out': 'bg-foreground/10 text-foreground border-foreground/30',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  upcoming:  'Upcoming',
  'sold-out': 'Sold Out',
  cancelled: 'Cancelled',
}

export default function EventsSection({ events }: { events: Event[] }) {
  if (!events.length) return null

  return (
    <section id="gigs" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Live Dates</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Upcoming Gigs</h2>
        </div>

        <div className="divide-y divide-border">
          {events.map(event => {
            const d = event.date ? formatDate(new Date(event.date)) : null
            return (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-6">
                {/* Date block */}
                {d && (
                  <div className="flex-shrink-0 w-20 text-center hidden sm:block">
                    <div className="text-2xl font-heading font-bold text-foreground leading-none">{d.day}</div>
                    <div className="text-xs uppercase tracking-widest text-accent mt-1">{d.month}</div>
                    <div className="text-xs text-muted">{d.year}</div>
                  </div>
                )}
                {d && (
                  <div className="sm:hidden text-sm text-muted">
                    {d.day} {d.month} {d.year}{d.time ? ` — ${d.time}` : ''}
                  </div>
                )}

                {/* Title is the primary heading — venue/location are secondary */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-xl font-semibold text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted mt-0.5">
                    {event.venue}{event.location ? `, ${event.location}` : ''}
                  </p>
                  {event.notes && <p className="text-sm text-muted mt-1 italic">{event.notes}</p>}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {d && <span className="hidden sm:block text-sm text-muted">{d.time}</span>}
                  <span className={`text-xs uppercase tracking-wider px-2 py-1 border rounded-sm ${STATUS_STYLES[event.status] ?? STATUS_STYLES.upcoming}`}>
                    {STATUS_LABELS[event.status] ?? event.status}
                  </span>
                  {event.ticketUrl && event.status === 'upcoming' && (
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest px-4 py-2 bg-accent text-white hover:bg-accent-dark transition-colors">
                      Tickets
                    </a>
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
