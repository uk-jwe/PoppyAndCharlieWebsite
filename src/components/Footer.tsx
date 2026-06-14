type Settings = { socialInstagram?: string | null; socialYoutube?: string | null; socialFacebook?: string | null } | null

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="bg-background border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">© {new Date().getFullYear()} Poppy &amp; Charlie. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-muted">
          {settings?.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Instagram</a>}
          {settings?.socialYoutube   && <a href={settings.socialYoutube}   target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">YouTube</a>}
          {settings?.socialFacebook  && <a href={settings.socialFacebook}  target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Facebook</a>}
          <a href="/admin" className="hover:text-accent transition-colors">Admin</a>
        </div>
      </div>
    </footer>
  )
}
