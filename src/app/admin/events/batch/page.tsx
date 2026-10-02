'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileImage, Loader2, Sparkles, UploadCloud, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import type { FlyerDraft } from '@/components/admin/flyer-upload'
import { draftToPayload, slugAttempts } from '@/lib/flyer-batch'
import { EventImage } from '@/components/events/event-image'

const ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const MAX_FILES = 25
const CONCURRENCY = 2

type Status = 'queued' | 'reading' | 'ready' | 'error' | 'creating' | 'created' | 'failed'

interface Item {
  id: string
  file: File
  status: Status
  draft?: FlyerDraft
  error?: string
  include: boolean
  eventId?: string
  slug?: string
}

let counter = 0

export default function BatchFlyersPage() {
  const [items, setItems] = useState<Item[]>([])
  const [dragging, setDragging] = useState(false)
  const [publish, setPublish] = useState(false)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const running = useRef(0)
  const started = useRef(new Set<string>())

  const patch = (id: string, p: Partial<Item>) => setItems(prev => prev.map(i => (i.id === id ? { ...i, ...p } : i)))
  const patchFields = (id: string, fields: Record<string, unknown>) =>
    setItems(prev => prev.map(i => (i.id === id && i.draft ? { ...i, draft: { ...i.draft, fields: { ...i.draft.fields, ...fields } } } : i)))

  const add = (files: FileList | File[]) => {
    const list = Array.from(files)
    const good = list.filter(f => ACCEPT.includes(f.type))
    const skipped = list.length - good.length
    const room = MAX_FILES - items.length
    setNotice([
      skipped ? `${skipped} file(s) skipped: only images and PDFs are read.` : '',
      good.length > room ? `Only ${MAX_FILES} flyers at a time; ${good.length - room} left out.` : '',
    ].filter(Boolean).join(' ') || null)
    setItems(prev => [...prev, ...good.slice(0, Math.max(0, room)).map(file => ({ id: `f${++counter}`, file, status: 'queued' as Status, include: true }))])
  }

  // Read queued flyers two at a time. Each read is one model call, so this paces cost and load.
  useEffect(() => {
    const next = items.filter(i => i.status === 'queued' && !started.current.has(i.id))
    while (running.current < CONCURRENCY && next.length > 0) {
      const item = next.shift()!
      running.current++
      started.current.add(item.id)
      patch(item.id, { status: 'reading' })
      const body = new FormData()
      body.append('flyer', item.file)
      fetch('/api/admin/events/extract-flyer', { method: 'POST', body })
        .then(async res => {
          const json = await res.json().catch(() => ({}))
          if (!res.ok) patch(item.id, { status: 'error', error: json.error ?? `Reading failed (${res.status})`, include: false })
          else patch(item.id, { status: 'ready', draft: json.draft })
        })
        .catch(() => patch(item.id, { status: 'error', error: 'Could not reach the server.', include: false }))
        .finally(() => { running.current--; setItems(p => [...p]) })
    }
  }, [items])

  const results = useMemo(() => items.map(i => ({
    id: i.id,
    ...(i.draft ? draftToPayload(i.draft.fields, i.draft.tiers, publish ? 'PUBLISHED' : 'DRAFT') : { payload: null, missing: [] as string[] }),
  })), [items, publish])
  const check = (id: string) => results.find(r => r.id === id)!

  const createable = items.filter(i => i.status === 'ready' && i.include && check(i.id).payload)
  const busyReading = items.some(i => i.status === 'queued' || i.status === 'reading')

  const createAll = async () => {
    setCreating(true)
    for (const item of createable) {
      const { payload } = check(item.id)
      if (!payload) continue
      patch(item.id, { status: 'creating' })
      let done = false
      let lastError = 'Failed'
      for (const slug of slugAttempts(payload.slug, payload.startDate)) {
        const res = await fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...payload, slug }) }).catch(() => null)
        if (!res) { lastError = 'Could not reach the server.'; break }
        const json = await res.json().catch(() => ({}))
        if (res.ok) { patch(item.id, { status: 'created', eventId: json.id, slug }); done = true; break }
        lastError = json.error ?? `Failed (${res.status})`
        if (!/slug already exists/i.test(lastError)) break
      }
      if (!done) patch(item.id, { status: 'failed', error: lastError })
    }
    setCreating(false)
  }

  const createdCount = items.filter(i => i.status === 'created').length

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3"><Link href="/admin/events"><ArrowLeft className="mr-1 h-4 w-4" />Events</Link></Button>
        <h1 className="text-3xl font-bold">Create events from flyers</h1>
        <p className="text-gray-600">Drop several flyers. Each is read, shown below for a quick check, and nothing is created until you click Create.</p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files) }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center ${dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50'}`}
      >
        <UploadCloud className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-700">Drag flyers here (images or PDFs, up to {MAX_FILES})</p>
        <input ref={input} type="file" multiple accept={ACCEPT.join(',')} className="hidden" onChange={e => { if (e.target.files) add(e.target.files); e.target.value = '' }} />
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}><FileImage className="mr-2 h-4 w-4" />Choose files</Button>
      </div>

      {notice && <Alert className="border-amber-200 bg-amber-50"><AlertDescription className="text-amber-900">{notice}</AlertDescription></Alert>}

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)} />
              Publish immediately <span className="text-gray-500">(otherwise saved as drafts to review on the Events page)</span>
            </label>
            <Button disabled={creating || busyReading || createable.length === 0} onClick={createAll}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Create {createable.length} event{createable.length === 1 ? '' : 's'}
            </Button>
          </div>
          {createdCount > 0 && !creating && (
            <Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-900">
              {createdCount} event{createdCount === 1 ? '' : 's'} created. <Link className="underline" href="/admin/events">Review them on the Events page</Link>.
            </AlertDescription></Alert>
          )}

          <div className="space-y-3">
            {items.map(i => {
              const r = check(i.id)
              const f = i.draft?.fields
              const locked = i.status === 'created' || i.status === 'creating'
              return (
                <Card key={i.id}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded border bg-gray-100">
                      {f?.image ? <EventImage src={f.image} alt="" className="h-full w-full object-cover object-top" />
                        : i.file.type.startsWith('image/') ? /* eslint-disable-next-line @next/next/no-img-element */ <ObjectImage file={i.file} />
                        : <div className="flex h-full items-center justify-center text-xs text-gray-400">PDF</div>}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-gray-500">{i.file.name}</p>
                        <StatusBadge item={i} />
                      </div>
                      {i.error && <p className="text-sm text-red-700">{i.error}</p>}
                      {f && (
                        <>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <Input aria-label="Title" disabled={locked} value={f.title ?? ''} onChange={e => patchFields(i.id, { title: e.target.value, slug: '' })} placeholder="Title" />
                            <Input aria-label="Venue" disabled={locked} value={f.location ?? ''} onChange={e => patchFields(i.id, { location: e.target.value, venueId: '' })} placeholder="Venue" />
                            <Input aria-label="Start" type="datetime-local" disabled={locked} value={f.startDate ?? ''} onChange={e => patchFields(i.id, { startDate: e.target.value })} />
                            <Input aria-label="End" type="datetime-local" disabled={locked} value={f.endDate ?? ''} onChange={e => patchFields(i.id, { endDate: e.target.value })} />
                          </div>
                          <p className="text-xs text-gray-600">
                            Tickets: {i.draft!.tiers.length ? i.draft!.tiers.map(t => `${t.name} $${t.price}`).join(' · ') : 'none found'}
                          </p>
                          {r.missing.length > 0 && <p className="text-xs font-medium text-red-700">Needs: {r.missing.join(', ')}</p>}
                          {i.draft!.lowConfidence.length > 0 && <p className="text-xs text-amber-800">Check: {i.draft!.lowConfidence.join(', ')}</p>}
                          {i.status === 'created' && i.eventId && <p className="text-xs text-green-700">Created. Tickets and details can be edited on the Events page.</p>}
                        </>
                      )}
                    </div>
                    {i.status === 'ready' && (
                      <label className="flex items-start gap-1 text-sm"><input type="checkbox" className="mt-1" checked={i.include && !!r.payload} disabled={!r.payload} onChange={e => patch(i.id, { include: e.target.checked })} />Include</label>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function ObjectImage({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="" className="h-full w-full object-cover object-top" /> : null
}

function StatusBadge({ item }: { item: Item }) {
  switch (item.status) {
    case 'queued': return <span className="text-xs text-gray-500">Waiting…</span>
    case 'reading': return <span className="flex items-center text-xs text-gray-600"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Reading flyer…</span>
    case 'creating': return <span className="flex items-center text-xs text-gray-600"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Creating…</span>
    case 'created': return <span className="flex items-center text-xs text-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Created</span>
    case 'error':
    case 'failed': return <span className="flex items-center text-xs text-red-700"><XCircle className="mr-1 h-3 w-3" />Not created</span>
    default: return <span className="text-xs text-gray-600">Ready to check</span>
  }
}
