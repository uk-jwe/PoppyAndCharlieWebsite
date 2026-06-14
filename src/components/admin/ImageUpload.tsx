'use client'
import { useState, useRef } from 'react'
import type { Media } from '@prisma/client'

interface Props {
  current?: Media | null
  onUploaded: (media: Media) => void
  label?: string
}

export default function ImageUpload({ current, onUploaded, label = 'Upload Image' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError('')
    setUploading(true)
    const altText = window.prompt('Alt text for this image (describe what it shows):', file.name.replace(/\.[^.]+$/, '')) ?? ''
    const fd = new FormData()
    fd.append('file', file)
    fd.append('altText', altText)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const media: Media = await res.json()
      onUploaded(media)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {current && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.urlThumbnail ?? current.urlOriginal} alt={current.altText}
            className="w-24 h-18 object-cover rounded border" style={{ height: '72px' }} />
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700">{current.altText}</p>
            <p>{current.filename}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors">
          {uploading ? 'Uploading…' : current ? 'Replace' : label}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {error && <p className="text-red-600 text-xs">{error}</p>}
      </div>
    </div>
  )
}
