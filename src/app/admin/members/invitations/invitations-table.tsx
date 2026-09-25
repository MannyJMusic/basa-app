'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface Row {
  userId: string
  name: string
  email: string
  businessName: string | null
  renewalDate: string | null
  lastInvitedAt: string | null
  invitations: number
}

const day = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(new Date(iso)) : '—'

export function InvitationsTable({ members }: { members: Row[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const toggle = (id: string, on: boolean) => setSelected(prev => { const s = new Set(prev); if (on) s.add(id); else s.delete(id); return s })
  const allOn = members.length > 0 && selected.size === members.length

  const send = async () => {
    const ids = Array.from(selected)
    if (!ids.length) return
    if (!window.confirm(`Email an account setup link to ${ids.length} member${ids.length === 1 ? '' : 's'}?`)) return
    setBusy(true); setMessage(null)
    try {
      const res = await fetch('/api/admin/members/invitations', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userIds: ids }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setMessage(json.error ?? `Failed (${res.status})`); return }
      const results: Array<{ status: string; email?: string; reason?: string }> = json.results ?? []
      const sent = results.filter(r => r.status === 'sent').length
      const other = results.filter(r => r.status !== 'sent')
      setMessage(`Sent ${sent}.` + (other.length ? ` Not sent: ${other.map(r => `${r.email ?? 'unknown'} (${r.reason})`).join('; ')}` : ''))
      setSelected(new Set())
      router.refresh()
    } catch {
      setMessage('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  if (!members.length) return <p className="rounded-lg border bg-white p-6 text-sm text-gray-600">Every active member has set up their account.</p>

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <Checkbox checked={allOn} onCheckedChange={v => setSelected(v === true ? new Set(members.map(m => m.userId)) : new Set())} aria-label="Select all" />
          Select all ({members.length})
        </label>
        <Button type="button" onClick={send} disabled={busy || selected.size === 0}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send invitation{selected.size === 1 ? '' : 's'}{selected.size ? ` (${selected.size})` : ''}
        </Button>
      </div>
      {message && <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-gray-800">{message}</p>}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-3 w-10"></th>
              <th className="p-3">Member</th>
              <th className="p-3">Business</th>
              <th className="p-3">Renews</th>
              <th className="p-3">Last invited</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map(m => (
              <tr key={m.userId} className={selected.has(m.userId) ? 'bg-blue-50/50' : ''}>
                <td className="p-3">
                  <Checkbox checked={selected.has(m.userId)} onCheckedChange={v => toggle(m.userId, v === true)} aria-label={`Select ${m.name}`} />
                </td>
                <td className="p-3"><div className="font-medium text-gray-900">{m.name}</div><div className="text-gray-600 break-all">{m.email}</div></td>
                <td className="p-3 text-gray-700">{m.businessName ?? '—'}</td>
                <td className="p-3 text-gray-700">{day(m.renewalDate)}</td>
                <td className="p-3 text-gray-700">{m.invitations ? `${day(m.lastInvitedAt)}${m.invitations > 1 ? ` (${m.invitations}×)` : ''}` : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
