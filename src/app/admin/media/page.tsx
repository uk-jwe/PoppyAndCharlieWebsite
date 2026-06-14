'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import ImageUpload from '@/components/admin/ImageUpload'

type MediaItem = {
  id: string
  filename: string
  altText: string
  urlThumbnail: string
  width: number
  height: number
  size: number
  mimeType: string
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function deleteItem(id: string, filename: string) {
    if (!confirm(`Delete ${filename}?`)) return
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Media Library</h1>

      <div className="mb-6">
        <ImageUpload onUploaded={() => { load() }} />
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg overflow-hidden bg-white group">
              <div className="relative aspect-video bg-gray-100">
                <Image src={item.urlThumbnail} alt={item.altText} fill className="object-cover" sizes="200px" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{item.filename}</p>
                <p className="text-xs text-gray-400">{item.altText}</p>
                <p className="text-xs text-gray-400">{(item.size / 1024).toFixed(0)} KB</p>
                <button onClick={() => deleteItem(item.id, item.filename)}
                  className="mt-1 text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
