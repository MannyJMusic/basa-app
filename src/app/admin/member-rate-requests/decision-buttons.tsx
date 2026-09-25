'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { MEMBERSHIP_TIERS, MEMBERSHIP_TIER_VALUES } from '@/lib/membership-tiers'

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`

const aYearFromNow = () => {
  const d = new Date(); d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export function DecisionButtons({ requestId, memberCents, heldCents, buyerName, alreadyMember }: {
  requestId: string; memberCents: number; heldCents: number; buyerName: string; alreadyMember: boolean
}) {
  const router = useRouter()
  const [note, setNote] = useState('')
  // Approve and remember: on by default, since a verified member is a member.
  const [markMember, setMarkMember] = useState(!alreadyMember)
  const [tier, setTier] = useState('')
  const [renewal, setRenewal] = useState(aYearFromNow)
  const [busy, setBusy] = useState<'approve' | 'deny' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const decide = async (decision: 'approve' | 'deny') => {
    const charge = decision === 'approve' ? memberCents : heldCents
    if (!window.confirm(`${decision === 'approve' ? 'Approve' : 'Deny'} and charge the card ${dollars(charge)}? This cannot be undone.`)) return
    setBusy(decision); setError(null)
    try {
      const res = await fetch(`/api/admin/member-rate-requests/${requestId}/decision`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          decision,
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(decision === 'approve' && markMember ? { markMember: { tier: tier || null, renewalDate: renewal } } : {}),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? `Failed (${res.status})`); return }
      if (json.membership?.status === 'failed') {
        window.alert(`Approved and charged, but the membership was not recorded (${json.membership.reason}). Set it in Admin → Members.`)
      }
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Note (optional, for the other admins)" value={note} onChange={e => setNote(e.target.value)} maxLength={500} />
      {alreadyMember ? (
        <p className="text-sm text-gray-700">{buyerName} is already an active member.</p>
      ) : (
        <div className="rounded-md border bg-white p-3 space-y-3">
          <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
            <Checkbox checked={markMember} onCheckedChange={v => setMarkMember(v === true)} className="mt-0.5" aria-label="Also make them an active member" />
            <span>
              <strong>If approving, also make {buyerName} an active member</strong>, so next time they sign in they get the
              member rate without asking. Nothing changes if you deny.
            </span>
          </label>
          {markMember && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
              <label className="text-sm text-gray-700">Tier
                <select className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={tier} onChange={e => setTier(e.target.value)}>
                  <option value="">No tier yet</option>
                  {MEMBERSHIP_TIER_VALUES.map(t => <option key={t} value={t}>{MEMBERSHIP_TIERS[t].label}</option>)}
                </select>
              </label>
              <label className="text-sm text-gray-700">Renews on
                <Input type="date" className="mt-1" value={renewal} onChange={e => setRenewal(e.target.value)} />
              </label>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button type="button" size="lg" disabled={busy !== null} onClick={() => decide('approve')} className="bg-green-700 hover:bg-green-800">
          {busy === 'approve' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
          Verified: charge {dollars(memberCents)}
        </Button>
        <Button type="button" size="lg" variant="outline" disabled={busy !== null} onClick={() => decide('deny')} className="border-red-300 text-red-800 hover:bg-red-50">
          {busy === 'deny' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />}
          Not a member: charge {dollars(heldCents)}
        </Button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
