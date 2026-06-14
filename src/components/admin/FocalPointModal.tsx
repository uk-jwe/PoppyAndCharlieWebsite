'use client'
import { useState, useRef } from 'react'

interface Props {
  imageUrl: string
  initialX: number
  initialY: number
  onSave: (x: number, y: number) => void
  onClose: () => void
  saving: boolean
}

export default function FocalPointModal({ imageUrl, initialX, initialY, onSave, onClose, saving }: Props) {
  const [x, setX] = useState(initialX)
  const [y, setY] = useState(initialY)
  const imgRef = useRef<HTMLImageElement>(null)

  function handleClick(e: React.MouseEvent) {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    setX(Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100))))
    setY(Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100))))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
        <div className="flex items-start justify-between p-4 border-b gap-4">
          <div>
            <h2 className="font-semibold">Set Focal Point</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click the subject on the image. This point stays visible when the image is cropped to different aspect ratios.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none flex-shrink-0">×</button>
        </div>

        <div className="p-4">
          <div className="relative inline-block cursor-crosshair select-none" onClick={handleClick}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt=""
              className="block max-w-full max-h-[60vh]"
              draggable={false}
            />
            {/* Focal point marker */}
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white shadow-[0_1px_0_rgba(0,0,0,0.4)] -translate-y-px" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white shadow-[1px_0_0_rgba(0,0,0,0.4)] -translate-x-px" />
              <div className="absolute inset-[38%] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{x}% × {y}%</p>
        </div>

        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={() => onSave(x, y)}
            disabled={saving}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-sm px-4 py-2 rounded border hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
