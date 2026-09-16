'use client'

import { useState } from 'react'
import { CheckCircle2, Undo2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CheckInButton({ registrationId, checkedInAt, checkedInBy }: { registrationId: string; checkedInAt: string | null; checkedInBy: string | null }) {
  const [at, setAt] = useState<string | null>(checkedInAt)
  const [by, setBy] = useState<string | null>(checkedInBy)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = async (checkedIn: boolean) => {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/check-in`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ checkedIn }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error ?? `Failed (${res.status})`); return }
      setAt(json.checkedInAt); setBy(json.checkedInBy)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  if (at) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-800 font-semibold">
          <CheckCircle2 className="h-6 w-6" /> Checked in {new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}
          {by && <span className="text-xs font-normal text-gray-600">by {by}</span>}
        </div>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => set(false)}>
          <Undo2 className="mr-1 h-4 w-4" /> Undo
        </Button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button type="button" size="lg" className="w-full text-lg" disabled={busy} onClick={() => set(true)}>
        {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
        Check in
      </Button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
