'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Trash2, Wand2, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageDropzone } from '@/components/admin/image-dropzone'
import { EventImage } from '@/components/events/event-image'
import { VenueMap } from '@/components/events/venue-map'

interface Venue {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  capacity: number | null
  website: string | null
  image: string | null
  latitude: number | null
  longitude: number | null
  _count?: { events: number }
}

interface Draft {
  name: string; address: string; city: string; state: string; zipCode: string
  capacity: string; website: string; image: string; latitude: string; longitude: string
}

const empty: Draft = { name: '', address: '', city: '', state: 'TX', zipCode: '', capacity: '', website: '', image: '', latitude: '', longitude: '' }
const toDraft = (v: Venue): Draft => ({
  name: v.name, address: v.address ?? '', city: v.city ?? '', state: v.state ?? '', zipCode: v.zipCode ?? '',
  capacity: v.capacity?.toString() ?? '', website: v.website ?? '', image: v.image ?? '',
  latitude: v.latitude?.toString() ?? '', longitude: v.longitude?.toString() ?? '',
})
const num = (s: string) => (s.trim() === '' ? null : Number(s))

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[] | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Venue | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(empty)
  const [busy, setBusy] = useState(false)
  const [finding, setFinding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/venues', { cache: 'no-store' })
    setVenues(res.ok ? await res.json() : [])
  }, [])
  useEffect(() => { load() }, [load])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (venues ?? []).filter(v => !q || [v.name, v.address, v.city].some(x => x?.toLowerCase().includes(q)))
  }, [venues, search])

  const open = (v: Venue | 'new') => { setEditing(v); setDraft(v === 'new' ? empty : toDraft(v)); setError(null) }
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, [k]: e.target.value }))

  const save = async () => {
    setBusy(true); setError(null)
    const body = {
      name: draft.name.trim(), address: draft.address, city: draft.city, state: draft.state, zipCode: draft.zipCode,
      capacity: num(draft.capacity), website: draft.website, image: draft.image,
      latitude: num(draft.latitude), longitude: num(draft.longitude),
    }
    try {
      const isNew = editing === 'new'
      const res = await fetch(isNew ? '/api/venues' : `/api/venues/${(editing as Venue).id}`, {
        method: isNew ? 'POST' : 'PUT', headers: { 'content-type': 'application/json' },
        // The create route ignores blanks by omission; send undefined rather than ''.
        body: JSON.stringify(isNew ? Object.fromEntries(Object.entries(body).filter(([, v]) => v !== '' && v !== null)) : body),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? `Save failed (${res.status})`); return }
      setEditing(null); await load()
    } catch { setError('Could not reach the server.') } finally { setBusy(false) }
  }

  const remove = async (v: Venue) => {
    if (!confirm(`Delete "${v.name}"?`)) return
    const res = await fetch(`/api/venues/${v.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setError(json.error ?? 'Delete failed'); return }
    setEditing(null); await load()
  }

  const findLogo = async () => {
    setFinding(true); setError(null)
    try {
      const res = await fetch('/api/admin/venues/find-logo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ website: draft.website }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? 'No logo found'); return }
      setDraft(d => ({ ...d, image: json.url }))
    } catch { setError('Could not reach the server.') } finally { setFinding(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-gray-600">Places BASA events happen: address, logo and map. Events pick from this list.</p>
        </div>
        <Button onClick={() => open('new')}><Plus className="mr-2 h-4 w-4" />Add venue</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input className="pl-10" placeholder="Search venues…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {venues === null ? (
        <p className="text-sm text-gray-500">Loading venues…</p>
      ) : shown.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">No venues match.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(v => (
            <Card key={v.id} className="cursor-pointer hover:shadow-md" onClick={() => open(v)}>
              <CardContent className="flex gap-3 p-4">
                {v.image ? (
                  <EventImage src={v.image} alt="" className="h-14 w-14 shrink-0 rounded border bg-white object-contain" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border bg-gray-50 text-gray-300"><MapPin className="h-6 w-6" /></div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.name}</p>
                  <p className="truncate text-sm text-gray-600">{[v.address, v.city].filter(Boolean).join(', ') || 'No address yet'}</p>
                  <Badge variant="secondary" className="mt-1">{v._count?.events ?? 0} event{v._count?.events === 1 ? '' : 's'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Add venue' : 'Edit venue'}</DialogTitle>
            <DialogDescription>Saved venues show their logo, address and a map on the event page.</DialogDescription>
          </DialogHeader>
          {error && <Alert className="border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>}
          <div className="space-y-4">
            <div><Label htmlFor="v-name">Name *</Label><Input id="v-name" value={draft.name} onChange={set('name')} /></div>
            <div><Label htmlFor="v-address">Street address</Label><Input id="v-address" value={draft.address} onChange={set('address')} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label htmlFor="v-city">City</Label><Input id="v-city" value={draft.city} onChange={set('city')} /></div>
              <div><Label htmlFor="v-state">State</Label><Input id="v-state" value={draft.state} onChange={set('state')} /></div>
              <div><Label htmlFor="v-zip">ZIP</Label><Input id="v-zip" value={draft.zipCode} onChange={set('zipCode')} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="v-web">Website</Label>
                <Input id="v-web" type="url" placeholder="https://" value={draft.website} onChange={set('website')} />
              </div>
              <div><Label htmlFor="v-cap">Capacity</Label><Input id="v-cap" type="number" min="1" value={draft.capacity} onChange={set('capacity')} /></div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label>Logo or photo</Label>
                <Button type="button" size="sm" variant="outline" disabled={finding || !draft.website.trim()} onClick={findLogo}>
                  {finding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1 h-4 w-4" />} Find from website
                </Button>
              </div>
              <ImageDropzone kind="venues" label="a logo" value={draft.image} onChange={url => setDraft(d => ({ ...d, image: url }))} />
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">Map pin (optional, the address is used otherwise)</summary>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div><Label htmlFor="v-lat">Latitude</Label><Input id="v-lat" type="number" step="any" value={draft.latitude} onChange={set('latitude')} /></div>
                <div><Label htmlFor="v-lng">Longitude</Label><Input id="v-lng" type="number" step="any" value={draft.longitude} onChange={set('longitude')} /></div>
              </div>
            </details>
            {draft.name && (draft.address || draft.city) && (
              <VenueMap name={draft.name} address={draft.address} city={draft.city} state={draft.state} zipCode={draft.zipCode}
                latitude={num(draft.latitude)} longitude={num(draft.longitude)} image={draft.image} website={draft.website} />
            )}
            <div className="flex items-center justify-between pt-2">
              {editing && editing !== 'new' ? (
                <Button type="button" variant="ghost" onClick={() => remove(editing)}><Trash2 className="mr-1 h-4 w-4 text-red-600" />Delete</Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="button" disabled={busy || !draft.name.trim()} onClick={save}>{busy ? 'Saving…' : 'Save venue'}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
