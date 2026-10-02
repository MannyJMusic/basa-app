'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, ImagePlus, X } from 'lucide-react'
import { EventImage } from '@/components/events/event-image'

interface ImageDropzoneProps {
  value: string | null | undefined
  onChange: (url: string) => void
  kind: 'events' | 'venues'
  label?: string
  disabled?: boolean
}

const TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/** Drag-and-drop (or click) image upload that stores the file and reports its URL. */
export function ImageDropzone({ value, onChange, kind, label = 'Image', disabled }: ImageDropzoneProps) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File) => {
    if (!TYPES.includes(file.type)) { setError('Use a JPG, PNG, GIF or WebP image.'); return }
    setBusy(true); setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', kind)
      const res = await fetch('/api/admin/uploads', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? `Upload failed (${res.status})`); return }
      onChange(json.url)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled && !busy) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f && !disabled && !busy) upload(f) }}
      className={`rounded-lg border border-dashed p-3 space-y-2 ${dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        {value ? (
          <EventImage src={value} alt={label} className="h-16 w-16 rounded object-cover border" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-50 text-gray-400"><ImagePlus className="h-6 w-6" /></div>
        )}
        <div className="flex-1 text-xs text-gray-600">
          {value ? 'Drop a new image to replace it.' : `Drag ${label.toLowerCase()} here, or choose a file.`}
        </div>
        <input ref={input} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
        <Button type="button" size="sm" variant="outline" disabled={disabled || busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1 h-4 w-4" />} Choose
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" disabled={disabled || busy} onClick={() => onChange('')} aria-label={`Remove ${label}`}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
