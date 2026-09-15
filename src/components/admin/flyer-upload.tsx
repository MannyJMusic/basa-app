'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, FileImage, Loader2, Sparkles } from 'lucide-react'
import type { CreateEventData } from '@/hooks/use-events'

export interface FlyerDraft {
  fields: Partial<CreateEventData>
  lowConfidence: string[]
  warnings: string[]
}

interface FlyerUploadProps {
  /** Called once with the draft; the parent decides how to merge it into the form. */
  onDraft: (draft: FlyerDraft) => void
  disabled?: boolean
}

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,application/pdf'

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

  const extract = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setDone(null)
    try {
      const body = new FormData()
      body.append('flyer', file)
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

  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <Sparkles className="h-4 w-4 text-amber-500" />
        Start from a flyer
        <span className="font-normal text-gray-500">(optional)</span>
      </div>
      <p className="text-xs text-gray-600">
        Upload the event flyer as an image or PDF and the fields below will be pre-filled for you to check.
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
        <Button type="button" size="sm" disabled={!file || disabled || busy} onClick={extract}>
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
              Pre-filled {Object.keys(done.fields).length} field{Object.keys(done.fields).length === 1 ? '' : 's'}.
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
