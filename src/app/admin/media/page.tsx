'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

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

type QueueItem = {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function addFiles(files: FileList | File[]) {
    const images = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!images.length) return
    setQueue(prev => [...prev, ...images.map(file => ({ file, status: 'pending' as const }))])
  }

  useEffect(() => {
    if (uploadingRef.current) return
    const pendingIdx = queue.findIndex(q => q.status === 'pending')
    if (pendingIdx === -1) return

    uploadingRef.current = true
    setQueue(prev => prev.map((q, i) => i === pendingIdx ? { ...q, status: 'uploading' } : q))

    const item = queue[pendingIdx]
    const fd = new FormData()
    fd.append('file', item.file)
    fd.append('altText', item.file.name.replace(/\.[^.]+$/, ''))

    fetch('/api/admin/upload', { method: 'POST', body: fd })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text())
        await load()
        setQueue(prev => prev.map((q, i) => i === pendingIdx ? { ...q, status: 'done' } : q))
      })
      .catch(e => {
        setQueue(prev => prev.map((q, i) =>
          i === pendingIdx ? { ...q, status: 'error', error: e instanceof Error ? e.message : 'Upload failed' } : q
        ))
      })
      .finally(() => { uploadingRef.current = false })
  }, [queue, load])

  async function deleteItem(id: string, filename: string) {
    if (!confirm(`Delete ${filename}?`)) return
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const activeQueue = queue.filter(q => q.status !== 'done')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Media Library</h1>

      {/* Upload zone */}
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragging ? 'border-gray-500 bg-gray-100' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <p className="text-sm text-gray-600">
          <span className="font-medium">Click to select</span> or drag and drop images here
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — up to 50 MB each</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { if (e.target.files) { addFiles(e.target.files); e.target.value = '' } }} />
      </div>

      {/* Upload queue */}
      {activeQueue.length > 0 && (
        <div className="mb-6 border rounded-lg divide-y bg-white">
          {activeQueue.map((q, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{q.file.name}</p>
                <p className="text-xs text-gray-400">{(q.file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              {q.status === 'pending' && <span className="text-xs text-gray-400">Waiting…</span>}
              {q.status === 'uploading' && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Uploading…
                </span>
              )}
              {q.status === 'error' && <span className="text-xs text-red-600">{q.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Gallery */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg overflow-hidden bg-white">
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
