'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`

export function DecisionButtons({ requestId, memberCents, heldCents }: { requestId: string; memberCents: number; heldCents: number }) {
  const router = useRouter()
  const [note, setNote] = useState('')
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
        body: JSON.stringify({ decision, ...(note.trim() ? { note: note.trim() } : {}) }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? `Failed (${res.status})`); return }
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
