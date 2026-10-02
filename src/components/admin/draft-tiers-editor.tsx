'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TierDraft, TierAudienceDraft } from '@/lib/flyer-draft'

interface Props {
  tiers: TierDraft[]
  onChange: (tiers: TierDraft[]) => void
}

const LABEL: Record<TierAudienceDraft, string> = { ALL: 'Everyone', MEMBER: 'Members only', NON_MEMBER: 'Future members' }

/** Ticket types to create with a new event. More can be edited later in the event's Tickets tab. */
export function DraftTiersEditor({ tiers, onChange }: Props) {
  const set = (i: number, patch: Partial<TierDraft>) => onChange(tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)))
  return (
    <div className="space-y-2">
      {tiers.length === 0 && <p className="text-xs text-gray-500">No ticket types yet. Nobody can register until there is one.</p>}
      {tiers.map((t, i) => (
        <div key={i} className="grid grid-cols-12 items-center gap-2">
          <Input className="col-span-5" aria-label="Ticket name" value={t.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Member" />
          <Input className="col-span-3" aria-label="Ticket price" type="number" min="0" step="0.01" value={Number.isNaN(t.price) ? '' : t.price} onChange={(e) => set(i, { price: e.target.value === '' ? NaN : Number(e.target.value) })} placeholder="$" />
          <select
            aria-label="Who can buy"
            className="col-span-3 h-10 rounded-md border border-input bg-background px-2 text-sm"
            value={t.audience}
            onChange={(e) => set(i, { audience: e.target.value as TierAudienceDraft })}
          >
            {(Object.keys(LABEL) as TierAudienceDraft[]).map((a) => <option key={a} value={a}>{LABEL[a]}</option>)}
          </select>
          <Button type="button" variant="ghost" size="sm" className="col-span-1" aria-label="Remove ticket type" onClick={() => onChange(tiers.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...tiers, { name: '', price: 0, audience: 'ALL' }])}>
        <Plus className="mr-1 h-4 w-4" /> Add ticket type
      </Button>
    </div>
  )
}
