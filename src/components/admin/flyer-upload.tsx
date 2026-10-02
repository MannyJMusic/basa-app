'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, FileImage, Loader2, Sparkles } from 'lucide-react'
import type { CreateEventData } from '@/hooks/use-events'
import type { TierDraft } from '@/lib/flyer-draft'

export interface FlyerDraft {
  fields: Partial<CreateEventData>
  tiers: TierDraft[]
  lowConfidence: string[]
  warnings: string[]
}

interface FlyerUploadProps {
  /** Called once with the draft; the parent decides how to merge it into the form. */
  onDraft: (draft: FlyerDraft) => void
  disabled?: boolean
}

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,application/pdf'
const ACCEPTED_TYPES = ACCEPT.split(',')

/**
 * "Create from flyer" (#69): upload an image or PDF, Claude pre-fills the form, the
 * admin confirms. This component only produces the draft; it never saves anything.
 */
export function FlyerUpload({ onDraft, disabled }: FlyerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<FlyerDraft | null>(null)

  const [dragging, setDragging] = useState(false)

  const extract = async (chosen: File | null = file) => {
    if (!chosen) return
    setBusy(true)
    setError(null)
    setDone(null)
    try {
      const body = new FormData()
      body.append('flyer', chosen)
      const res = await fetch('/api/admin/events/extract-flyer', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Reading the flyer failed (${res.status})`)
        return
      }
      const draft: FlyerDraft = json.draft
      setDone(draft)
      onDraft(draft)
    } catch {
      setError('Could not reach the server to read the flyer.')
    } finally {
      setBusy(false)
    }
  }

  // Dropping a flyer reads it straight away; choosing one waits for the button.
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled || busy) return
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return
    if (!ACCEPTED_TYPES.includes(dropped.type)) {
      setError('Drop an image (JPG, PNG, GIF, WebP) or a PDF.')
      return
    }
    setFile(dropped)
    setDone(null)
    extract(dropped)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled && !busy) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-lg border border-dashed p-4 space-y-3 transition-colors ${dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50'}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <Sparkles className="h-4 w-4 text-amber-500" />
        Start from a flyer
        <span className="font-normal text-gray-500">(optional)</span>
      </div>
      <p className="text-xs text-gray-600">
        Drag the event flyer here, or choose a file. The fields below will be pre-filled for you to check, including member and future member tickets.
        Nothing is saved until you click Create Event.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setError(null)
            setDone(null)
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
          <FileImage className="h-4 w-4 mr-2" />
          {file ? 'Choose a different file' : 'Choose flyer'}
        </Button>
        {file && (
          <span className="text-xs text-gray-700 truncate max-w-[16rem]" title={file.name}>
            {file.name} ({(file.size / 1024).toFixed(0)} KB)
          </span>
        )}
        <Button type="button" size="sm" disabled={!file || disabled || busy} onClick={() => extract()}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {busy ? 'Reading flyer…' : 'Pre-fill from flyer'}
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {done && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 space-y-1">
            <div>
              Pre-filled {Object.keys(done.fields).length} field{Object.keys(done.fields).length === 1 ? '' : 's'}
              {done.tiers.length > 0 && <> and {done.tiers.length} ticket type{done.tiers.length === 1 ? '' : 's'}</>}.
              {done.lowConfidence.length > 0 && (
                <>
                  {' '}Check these first: <strong>{done.lowConfidence.join(', ')}</strong>.
                </>
              )}
            </div>
            {done.warnings.length > 0 && (
              <ul className="list-disc pl-5 text-xs space-y-0.5">
                {done.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
