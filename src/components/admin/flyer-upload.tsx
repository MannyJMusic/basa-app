'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Loader2, Sparkles, UploadCloud } from 'lucide-react'
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
 * "Create from flyer" (#69): drop (or choose) an image or PDF, Claude pre-fills the
 * form, the admin confirms. The drop works anywhere on the page while this is shown,
 * so a flyer dropped slightly off target is read instead of opening in the browser.
 * This component only produces the draft; it never saves anything.
 */
export function FlyerUpload({ onDraft, disabled }: FlyerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<FlyerDraft | null>(null)
  const [dragging, setDragging] = useState(false)

  const extract = useCallback(async (chosen: File) => {
    if (!ACCEPTED_TYPES.includes(chosen.type)) {
      setError('Use an image (JPG, PNG, GIF, WebP) or a PDF.')
      return
    }
    setFileName(chosen.name)
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
  }, [onDraft])

  // Keep the latest handler for the window listeners without re-binding them.
  const latest = useRef({ extract, blocked: false })
  latest.current = { extract, blocked: !!disabled || busy }

  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const over = (e: DragEvent) => { if (hasFiles(e)) { e.preventDefault(); setDragging(true) } }
    const leave = (e: DragEvent) => { if (!e.relatedTarget) setDragging(false) }
    const drop = (e: DragEvent) => {
      setDragging(false)
      // A more specific drop target (the event image field) already took it.
      if (!hasFiles(e) || e.defaultPrevented) return
      e.preventDefault()
      const f = e.dataTransfer?.files?.[0]
      if (f && !latest.current.blocked) latest.current.extract(f)
    }
    window.addEventListener('dragover', over)
    window.addEventListener('dragleave', leave)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragover', over)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('drop', drop)
    }
  }, [])

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) extract(f)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors disabled:cursor-wait ${
          dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/50'
        }`}
      >
        {busy ? <Loader2 className="h-8 w-8 animate-spin text-amber-500" /> : <UploadCloud className="h-8 w-8 text-amber-500" />}
        <span className="text-base font-semibold text-gray-900">
          {busy ? `Reading ${fileName ?? 'flyer'}…` : dragging ? 'Drop it to pre-fill the event' : 'Drop the event flyer here to pre-fill this form'}
        </span>
        <span className="text-xs text-gray-600">
          {busy
            ? 'This takes a few seconds.'
            : 'or click to choose an image or PDF. Details and member and future member tickets are filled in for you to check. Nothing is saved until you click Create Event.'}
        </span>
      </button>

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
