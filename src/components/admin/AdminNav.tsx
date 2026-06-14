'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

const LINKS = [
  { href: '/admin/settings', label: 'Site Settings' },
  { href: '/admin/theme',    label: 'Theme' },
  { href: '/admin/events',   label: 'Events' },
  { href: '/admin/videos',   label: 'Videos' },
  { href: '/admin/photos',   label: 'Photos' },
  { href: '/admin/media',    label: 'Media Library' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-gray-900 text-white min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <Link href="/admin" className="font-semibold text-sm">P&amp;C Admin</Link>
      </div>
      <nav className="flex-1 p-2">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className={`block px-3 py-2 rounded text-sm mb-0.5 transition-colors ${
              pathname.startsWith(l.href) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link href="/" target="_blank" className="block text-xs text-gray-400 hover:text-white transition-colors">
          View Site ↗
        </Link>
        <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-white transition-colors">
          Sign Out
        </button>
      </div>
    </aside>
  )
}
