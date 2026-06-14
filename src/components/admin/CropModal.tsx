'use client'
import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

interface Props {
  imageUrl: string
  onSave: (crop: Area) => void
  onClose: () => void
  saving: boolean
}

const ASPECTS = [
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '1:1', value: 1 },
  { label: '3:4', value: 3 / 4 },
]

export default function CropModal({ imageUrl, onSave, onClose, saving }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(4 / 3)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Crop Image</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>

        <div className="relative bg-gray-900" style={{ height: 400 }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-4 py-3 space-y-3 border-t">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10 shrink-0">Zoom</span>
            <input type="range" min={1} max={3} step={0.01} value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 accent-gray-800" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10 shrink-0">Ratio</span>
            <div className="flex gap-1">
              {ASPECTS.map(a => (
                <button key={a.label} onClick={() => setAspect(a.value)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    aspect === a.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => croppedAreaPixels && onSave(croppedAreaPixels)}
              disabled={!croppedAreaPixels || saving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
