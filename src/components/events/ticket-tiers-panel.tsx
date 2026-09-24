'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface AdminTier {
  id: string
  name: string
  description: string | null
  price: number
  memberPrice: number | null
  quantity: number | null
  sold: number
  isActive: boolean
  sortOrder: number
  audience: Audience
  nonMemberTierId: string | null
}

type Audience = 'ALL' | 'MEMBER' | 'NON_MEMBER'

interface Draft {
  name: string
  price: string
  memberPrice: string
  quantity: string
  description: string
  audience: Audience
  nonMemberTierId: string
}

const emptyDraft: Draft = { name: '', price: '', memberPrice: '', quantity: '', description: '', audience: 'ALL', nonMemberTierId: '' }

const AUDIENCE_LABEL: Record<Audience, string> = { ALL: 'Everyone', MEMBER: 'Members only', NON_MEMBER: 'Non-members only' }

/**
 * Ticket types for one event, in the admin dialog (#160). Add, edit, switch on and
 * off, delete. Prices are dollars; blank member price means members pay the
 * regular price; blank quantity means unlimited (bounded by event capacity).
 */
export function TicketTiersPanel({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<AdminTier[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState<Draft | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/events/${eventId}/ticket-tiers`, { cache: 'no-store' })
    if (!res.ok) { setError(`Could not load ticket types (${res.status})`); return }
    setTiers(await res.json())
  }, [eventId])

  useEffect(() => { load() }, [load])

  const call = async (label: string, fn: () => Promise<Response>) => {
    setBusy(label); setError(null)
    try {
      const res = await fn()
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? `Failed (${res.status})`); return false }
      if (json.reason) setError(json.reason)
      await load()
      return true
    } catch {
      setError('Could not reach the server.'); return false
    } finally {
      setBusy(null)
    }
  }

  const toBody = (d: Draft) => ({
    name: d.name.trim(),
    price: Number(d.price),
    memberPrice: d.memberPrice.trim() === '' ? null : Number(d.memberPrice),
    quantity: d.quantity.trim() === '' ? null : Number(d.quantity),
    description: d.description.trim() === '' ? null : d.description.trim(),
    audience: d.audience,
    nonMemberTierId: d.audience === 'MEMBER' && d.nonMemberTierId ? d.nonMemberTierId : null,
  })
  const nonMemberTiers = tiers?.filter(t => t.audience === 'NON_MEMBER') ?? []

  if (tiers === null) return <div className="py-8 text-center text-sm text-gray-500">{error ?? 'Loading ticket types…'}</div>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ticket types ({tiers.length})</h3>
        {!adding && (
          <Button type="button" size="sm" onClick={() => setAdding({ ...emptyDraft })}>
            <Plus className="mr-1 h-4 w-4" /> Add ticket type
          </Button>
        )}
      </div>

      {error && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>}

      {tiers.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          No ticket types yet. Nobody can register until there is at least one.
        </p>
      )}

      {tiers.map(t => (
        <TierRow
          key={t.id}
          tier={t}
          nonMemberTiers={nonMemberTiers.filter(n => n.id !== t.id)}
          busy={busy === t.id}
          onSave={(d) => call(t.id, () => fetch(`/api/admin/events/${eventId}/ticket-tiers/${t.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(toBody(d)) }))}
          onToggle={(isActive) => call(t.id, () => fetch(`/api/admin/events/${eventId}/ticket-tiers/${t.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isActive }) }))}
          onDelete={() => { if (confirm(`Remove "${t.name}"?${t.sold ? ` ${t.sold} sold; it will be switched off instead.` : ''}`)) call(t.id, () => fetch(`/api/admin/events/${eventId}/ticket-tiers/${t.id}`, { method: 'DELETE' })) }}
        />
      ))}

      {adding && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <DraftFields draft={adding} onChange={setAdding} idPrefix="new" nonMemberTiers={nonMemberTiers} />
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" disabled={busy === 'new' || !adding.name.trim() || adding.price.trim() === ''}
              onClick={async () => { if (await call('new', () => fetch(`/api/admin/events/${eventId}/ticket-tiers`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(toBody(adding)) }))) setAdding(null) }}>
              {busy === 'new' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Save ticket type
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TierRow({ tier, nonMemberTiers, busy, onSave, onToggle, onDelete }: {
  tier: AdminTier; nonMemberTiers: AdminTier[]; busy: boolean
  onSave: (d: Draft) => Promise<boolean>; onToggle: (isActive: boolean) => Promise<boolean>; onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    name: tier.name, price: String(tier.price), memberPrice: tier.memberPrice === null ? '' : String(tier.memberPrice),
    quantity: tier.quantity === null ? '' : String(tier.quantity), description: tier.description ?? '',
    audience: tier.audience, nonMemberTierId: tier.nonMemberTierId ?? '',
  })
  const pairedWith = tier.nonMemberTierId ? nonMemberTiers.find(n => n.id === tier.nonMemberTierId) : undefined
  const remaining = tier.quantity === null ? null : Math.max(0, tier.quantity - tier.sold)

  return (
    <div className={`rounded-lg border p-3 ${tier.isActive ? '' : 'bg-gray-50 opacity-80'}`}>
      {!editing ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{tier.name}</span>
              {!tier.isActive && <Badge className="bg-gray-200 text-gray-700">Off sale</Badge>}
              {remaining === 0 && tier.isActive && <Badge className="bg-red-100 text-red-800">Sold out</Badge>}
              {tier.audience !== 'ALL' && <Badge className="bg-blue-100 text-blue-900">{AUDIENCE_LABEL[tier.audience]}</Badge>}
            </div>
            <div className="text-sm text-gray-600">
              ${tier.price.toFixed(2)}{tier.memberPrice !== null ? ` · members $${tier.memberPrice.toFixed(2)}` : ''}
              {' · '}{tier.sold} sold{tier.quantity !== null ? ` of ${tier.quantity}` : ''}
            </div>
            {tier.description && <div className="text-xs text-gray-500">{tier.description}</div>}
            {tier.audience === 'MEMBER' && (
              <div className="text-xs text-gray-500">
                {pairedWith
                  ? `Guests asking to be verified are held at "${pairedWith.name}" ($${pairedWith.price.toFixed(2)})`
                  : 'Not paired with a non-member tier: guests must sign in as members to buy it'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Label className="flex items-center gap-2 text-xs text-gray-600">
              <Switch checked={tier.isActive} disabled={busy} onCheckedChange={(v) => onToggle(v)} aria-label={`${tier.name} on sale`} /> On sale
            </Label>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setEditing(true)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onDelete} aria-label={`Remove ${tier.name}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
          </div>
        </div>
      ) : (
        <div>
          <DraftFields draft={draft} onChange={setDraft} idPrefix={tier.id} nonMemberTiers={nonMemberTiers} />
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" disabled={busy || !draft.name.trim() || draft.price.trim() === ''} onClick={async () => { if (await onSave(draft)) setEditing(false) }}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DraftFields({ draft, onChange, idPrefix, nonMemberTiers }: { draft: Draft; onChange: (d: Draft) => void; idPrefix: string; nonMemberTiers: AdminTier[] }) {
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...draft, [k]: e.target.value })
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-name`}>Name *</Label>
        <Input id={`${idPrefix}-name`} value={draft.name} onChange={set('name')} placeholder="Member, Future Member, Table of 8…" />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-price`}>Price $ *</Label>
        <Input id={`${idPrefix}-price`} type="number" min="0" step="0.01" value={draft.price} onChange={set('price')} />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-member`}>Member $</Label>
        <Input id={`${idPrefix}-member`} type="number" min="0" step="0.01" value={draft.memberPrice} onChange={set('memberPrice')} placeholder="same" />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-qty`}>Quantity</Label>
        <Input id={`${idPrefix}-qty`} type="number" min="1" step="1" value={draft.quantity} onChange={set('quantity')} placeholder="unlimited" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-audience`}>Who can buy</Label>
        <select
          id={`${idPrefix}-audience`}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={draft.audience}
          onChange={e => onChange({ ...draft, audience: e.target.value as Audience, nonMemberTierId: e.target.value === 'MEMBER' ? draft.nonMemberTierId : '' })}
        >
          <option value="ALL">Everyone</option>
          <option value="MEMBER">Members only</option>
          <option value="NON_MEMBER">Non-members only</option>
        </select>
      </div>
      {draft.audience === 'MEMBER' && (
        <div className="sm:col-span-4">
          <Label htmlFor={`${idPrefix}-pair`}>Hold unverified members at</Label>
          <select
            id={`${idPrefix}-pair`}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={draft.nonMemberTierId}
            onChange={e => onChange({ ...draft, nonMemberTierId: e.target.value })}
          >
            <option value="">No pairing (guests must sign in)</option>
            {nonMemberTiers.map(n => <option key={n.id} value={n.id}>{n.name} (${n.price.toFixed(2)})</option>)}
          </select>
        </div>
      )}
      <div className="col-span-2 sm:col-span-6">
        <Label htmlFor={`${idPrefix}-desc`}>Description</Label>
        <Input id={`${idPrefix}-desc`} value={draft.description} onChange={set('description')} placeholder="Optional, shown under the name" />
      </div>
    </div>
  )
}
