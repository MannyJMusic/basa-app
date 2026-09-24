'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ticket, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * On the payment success page for an event: turns the PaymentIntent id into the
 * ticket link (#159). Polls briefly, because the registration row is written
 * before Stripe returns to the browser but the lookup can race a slow database.
 */
export function EventTicketPanel({ paymentId }: { paymentId: string }) {
  const [state, setState] = useState<{ token: string; eventTitle: string; memberRate: { status: string; heldCents: number; memberCents: number } | null } | 'loading' | 'missing'>('loading')

  useEffect(() => {
    let cancelled = false
    let attempts = 0
    const look = async () => {
      attempts++
      try {
        const res = await fetch(`/api/tickets/by-payment?paymentId=${encodeURIComponent(paymentId)}`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (!cancelled) setState({ token: json.token, eventTitle: json.event?.title ?? 'your event', memberRate: json.memberRate ?? null })
          return
        }
      } catch {
        /* retry below */
      }
      if (!cancelled && attempts < 5) setTimeout(look, 1500)
      else if (!cancelled) setState('missing')
    }
    look()
    return () => { cancelled = true }
  }, [paymentId])

  if (state === 'loading') return <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">Preparing your ticket…</div>
  if (state === 'missing') {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-gray-700">
        Your payment went through. Your ticket and a confirmation email are on their way; if nothing arrives within a few minutes, email info@businessassociationsa.com with this reference: <code className="text-xs">{paymentId}</code>.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6">
      <div className="flex items-start gap-3">
        <Ticket className="mt-0.5 h-6 w-6 text-green-700" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">You&apos;re registered for {state.eventTitle}</h2>
          <p className="mt-1 text-sm text-gray-700">
            Your ticket has a QR code to show at the door. Print it, save it as a PDF, or take a screenshot.
            A copy is also on its way by email.
          </p>
          {state.memberRate && ['AWAITING_PAYMENT', 'PENDING'].includes(state.memberRate.status) && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-gray-800">
              <strong>Member rate pending.</strong> Your card has a hold of ${(state.memberRate.heldCents / 100).toFixed(2)}, not a charge.
              Once we verify your membership you will be charged ${(state.memberRate.memberCents / 100).toFixed(2)}; if we can&apos;t,
              you will be charged ${(state.memberRate.heldCents / 100).toFixed(2)}. We&apos;ll email you either way.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tickets/${state.token}`}>
                <Ticket className="mr-2 h-4 w-4" /> View and print your ticket
              </Link>
            </Button>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Mail className="h-3.5 w-3.5" /> Check your inbox (and spam) for the confirmation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
