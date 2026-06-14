'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MediaPicker from '@/components/admin/MediaPicker'
import type { Photo, Media } from '@prisma/client'

type PhotoWithMedia = Photo & { media: Media | null }

export default function EditPhotoClient({ photo }: { photo: PhotoWithMedia }) {
  const router = useRouter()
  const [mediaId, setMediaId] = useState<string>(photo.mediaId)
  const [mediaUrl, setMediaUrl] = useState<string | null>(photo.media?.urlCard ?? null)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch(`/api/admin/photos/${photo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:   fd.get('title'),
        caption: fd.get('caption'),
        order:   parseInt(fd.get('order') as string) || photo.order,
        mediaId,
      }),
    })
    if (res.ok) {
      router.push('/admin/photos')
      router.refresh()
    } else {
      alert('Failed to save')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/photos" className="text-gray-500 hover:text-gray-700">← Photos</Link>
        <h1 className="text-2xl font-bold">Edit Photo</h1>
      </div>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Image *</label>
          <MediaPicker
            onSelect={(id, url) => { setMediaId(id); setMediaUrl(url) }}
            selectedUrl={mediaUrl}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" name="title" required defaultValue={photo.title}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Caption</label>
          <input type="text" name="caption" defaultValue={photo.caption ?? ''}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Display Order</label>
          <input type="number" name="order" defaultValue={photo.order} min={1}
            className="w-24 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <button type="submit" disabled={saving}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
