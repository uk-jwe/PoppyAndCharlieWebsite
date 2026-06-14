'use client'
import { useState, useEffect } from 'react'
import type { Media } from '@prisma/client'
import ImageUpload from './ImageUpload'

interface Props {
  value: Media | null
  onChange: (media: Media | null) => void
  label?: string
}

export default function MediaPicker({ value, onChange, label = 'Select Image' }: Props) {
  const [open, setOpen] = useState(false)
  const [library, setLibrary] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)

  async function loadLibrary() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      const data = await res.json()
      setLibrary(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (open) loadLibrary() }, [open])

  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.urlThumbnail ?? value.urlOriginal} alt={value.altText}
            className="w-24 object-cover rounded border" style={{ height: '72px' }} />
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700">{value.altText}</p>
            <p>{value.filename}</p>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(true)}
          className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 transition-colors">
          {value ? 'Change' : label}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)}
            className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors">
            Remove
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Media Library</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 border-b">
              <ImageUpload label="Upload New" onUploaded={m => { onChange(m); setOpen(false) }} />
            </div>
            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {library.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => { onChange(m); setOpen(false) }}
                      className={`group relative border-2 rounded overflow-hidden aspect-square hover:border-gray-800 transition-colors ${value?.id === m.id ? 'border-gray-800' : 'border-transparent'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.urlThumbnail ?? m.urlOriginal} alt={m.altText}
                        className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.altText}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
