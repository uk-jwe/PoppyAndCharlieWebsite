'use client'
import { useState } from 'react'
import Link from 'next/link'

type Settings = {
  heroTitle?: string | null
  socialInstagram?: string | null
  socialYoutube?: string | null
} | null

const NAV_LINKS = [
  { href: '#about',   label: 'About' },
  { href: '#videos',  label: 'Videos' },
  { href: '#gigs',    label: 'Gigs' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
]

export default function Navigation({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false)
  const name = settings?.heroTitle || 'Poppy & Charlie'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl font-bold text-foreground tracking-wide">
          {name}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href}
              className="text-sm uppercase tracking-widest text-muted hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {settings?.socialInstagram && (
            <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"
              aria-label="Instagram" className="text-muted hover:text-accent transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          )}
          {settings?.socialYoutube && (
            <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer"
              aria-label="YouTube" className="text-muted hover:text-accent transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          )}
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) :
                    (<><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>)}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border px-6 py-4">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-3 text-sm uppercase tracking-widest text-muted hover:text-foreground border-b border-border last:border-0">
              {l.label}
            </a>
          ))}
          <div className="flex gap-4 pt-4 text-sm text-muted">
            {settings?.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent">Instagram</a>}
            {settings?.socialYoutube   && <a href={settings.socialYoutube}   target="_blank" rel="noopener noreferrer" className="hover:text-accent">YouTube</a>}
          </div>
        </div>
      )}
    </header>
  )
}
