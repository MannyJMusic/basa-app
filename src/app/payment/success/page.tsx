'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowRight, Calendar, CheckCircle, Mail } from 'lucide-react'
import { EventTicketPanel } from '@/components/events/event-ticket-panel'
import { Button } from '@/components/ui/button'

/**
 * Where an event ticket purchase lands after Stripe confirms the card (the
 * StripeForm redirect, or Stripe's own redirect after 3-D Secure, which adds
 * `payment_intent`). The ticket itself is confirmed by the webhook; the panel polls
 * for it. Memberships no longer come here: they use Stripe Checkout and
 * /membership/welcome.
 */
function SuccessContent() {
  const params = useSearchParams()
  const paymentId = params.get('paymentId') ?? params.get('payment_intent')
  const type = params.get('type') ?? 'event'
  const failed = params.get('redirect_status') === 'failed'

  if (type === 'membership') {
    return (
      <Shell>
        <CheckCircle className="mx-auto h-14 w-14 text-green-600" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Thank you</h1>
        <p className="mt-2 text-gray-700">Your membership details are in your dashboard and your confirmation email.</p>
        <Button asChild className="mt-6"><Link href="/dashboard/membership">My membership</Link></Button>
      </Shell>
    )
  }

  if (!paymentId || failed) {
    return (
      <Shell>
        <AlertCircle className="mx-auto h-14 w-14 text-red-600" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">We couldn&apos;t confirm your payment</h1>
        <p className="mt-2 text-gray-700">
          If you were charged, your ticket email is on its way. Otherwise you can try again from the event page, or email
          info@businessassociationsa.com and we&apos;ll sort it out.
        </p>
        <Button asChild className="mt-6"><Link href="/events">Back to events</Link></Button>
      </Shell>
    )
  }

  return (
    <Shell>
      <CheckCircle className="mx-auto h-14 w-14 text-green-600" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment successful</h1>
      <p className="mt-2 text-gray-700">Thank you! Here is your ticket.</p>
      <div className="mt-8 text-left"><EventTicketPanel paymentId={paymentId} /></div>
      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
        <Mail className="h-4 w-4" aria-hidden="true" /> A copy has been emailed to you.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/events"><Calendar className="mr-2 h-4 w-4" />More events</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard">Go to dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[60vh] bg-gray-50 py-16"><div className="mx-auto max-w-2xl px-4 text-center">{children}</div></div>
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Shell><p className="text-gray-600">Loading…</p></Shell>}>
      <SuccessContent />
    </Suspense>
  )
}
