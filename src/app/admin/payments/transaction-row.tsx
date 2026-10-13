'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExternalLink } from 'lucide-react'
import type { Transaction, TransactionStatus } from '@/lib/admin-payments'

const STATUS_LABEL: Record<TransactionStatus, string> = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
}

const BADGE: Record<TransactionStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

const dollars = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const when = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(d)
const whenLong = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' }).format(d)

/**
 * One transaction. The whole row opens a panel showing what was paid for: the
 * ticket tiers or membership level, attendees, member-rate status, and links to
 * the event page and the payment in Stripe.
 */
export function TransactionRow({ t }: { t: Transaction }) {
  const [open, setOpen] = useState(false)
  const b = t.breakdown
  const lineTotal = b.lines.reduce((sum, l) => sum + (l.amountCents ?? 0), 0)

  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        aria-label={`Show what ${t.customerName} paid for: ${t.title}`}
        onClick={() => setOpen(true)}
        onKeyDown={e => {
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="border-b cursor-pointer align-top hover:bg-blue-50/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <td className="py-3 px-4">
          <div className="font-medium text-blue-800 underline-offset-2 hover:underline">{t.title}</div>
          {t.detail && <div className="text-sm text-gray-500">{t.detail}</div>}
          {t.reference && <div className="text-xs text-gray-400 break-all">{t.reference}</div>}
        </td>
        <td className="py-3 px-4">
          <div className="font-medium">{t.customerName}</div>
          <div className="text-sm text-gray-500 break-all">{t.customerEmail}</div>
        </td>
        <td className="py-3 px-4 font-medium">{dollars(t.amountCents)}</td>
        <td className="py-3 px-4 text-sm">{t.method}</td>
        <td className="py-3 px-4">
          <Badge className={BADGE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
        </td>
        <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{when(t.at)}</td>
      </tr>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-6">{t.title}</DialogTitle>
            <DialogDescription>
              {t.customerName}
              {t.customerEmail ? ` · ${t.customerEmail}` : ''} · {whenLong(t.at)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <Badge className={BADGE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
            <span className="text-2xl font-bold">{dollars(t.amountCents)}</span>
          </div>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">What was paid for</h3>
            <ul className="divide-y rounded-md border">
              {b.lines.map((l, i) => (
                <li key={i} className="flex items-start justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">
                      {l.quantity && l.quantity > 1 ? `${l.quantity} × ` : ''}
                      {l.label}
                    </div>
                    {l.note && <div className="text-gray-500">{l.note}</div>}
                  </div>
                  {l.amountCents != null && <div className="shrink-0 font-medium">{dollars(l.amountCents)}</div>}
                </li>
              ))}
            </ul>
            {b.lines.length > 1 && lineTotal !== t.amountCents && (
              <p className="mt-1 text-xs text-gray-500">
                Lines add up to {dollars(lineTotal)}; the amount charged was {dollars(t.amountCents)}.
              </p>
            )}
          </section>

          {b.facts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
              <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
                {b.facts.map(f => (
                  <div key={f.label} className="contents">
                    <dt className="text-gray-500">{f.label}</dt>
                    <dd className="text-gray-900 break-words">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {t.reference && (
            <p className="text-xs text-gray-500 break-all">
              Reference: <span className="font-mono">{t.reference}</span>
            </p>
          )}

          {b.links.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1">
              {b.links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                >
                  {l.label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
