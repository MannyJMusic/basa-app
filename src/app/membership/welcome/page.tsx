import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Mail } from 'lucide-react'
import { getStripe } from '@/lib/stripe'
import { MEMBERSHIP_TIERS } from '@/lib/membership-tiers'
import { MEMBERSHIP_METADATA_TYPE } from '@/lib/membership-billing'
import { OFFICE_CONTACT } from '@/lib/feature-flags'
import type { MembershipTier } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Welcome to BASA', robots: { index: false } }

/** a***@example.com: enough for the buyer to recognise, nothing for anyone else. */
function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  return domain ? `${user.slice(0, 1)}***@${domain}` : ''
}

async function loadSession(id: string | undefined) {
  if (!id || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return null
  try {
    const s = await getStripe().checkout.sessions.retrieve(id)
    if (s.metadata?.type !== MEMBERSHIP_METADATA_TYPE) return null
    return s
  } catch {
    return null
  }
}

/**
 * Where Stripe Checkout returns the buyer. It only reports what Stripe says; the
 * membership itself is granted by the webhook, which may land a few seconds later.
 */
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  const session = await loadSession(session_id)
  const paid = session?.status === 'complete' && session.payment_status === 'paid'
  const tier = session?.metadata?.tier as MembershipTier | undefined
  const label = tier && MEMBERSHIP_TIERS[tier] ? MEMBERSHIP_TIERS[tier].label : 'BASA'
  const email = session?.metadata?.email ? maskEmail(session.metadata.email) : null

  if (!paid) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">We couldn&apos;t confirm a payment</h1>
        <p className="text-gray-700 mb-6">
          If you completed checkout, your confirmation email is on its way. Otherwise you have not been charged and can{' '}
          <Link href="/membership/join" className="text-blue-700 underline">try again</Link>. Questions? Call {OFFICE_CONTACT.name} at{' '}
          <a href={OFFICE_CONTACT.phoneHref} className="text-blue-700 underline">{OFFICE_CONTACT.phone}</a>.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-bold text-blue-900">Welcome to BASA!</h1>
      <p className="mt-3 text-lg text-gray-700">Your {label} membership is paid and active.</p>
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left space-y-3 text-gray-700">
        <p className="flex gap-2">
          <Mail className="h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
          <span>
            We&apos;ve emailed {email ?? 'you'} a receipt and a welcome message. If this is your first BASA account, the email has a
            link to set your password; it can take a few minutes to arrive.
          </span>
        </p>
        <p>Your membership renews automatically each year. You can update your card or cancel from your member dashboard.</p>
        <p>{OFFICE_CONTACT.name} from the BASA office will be in touch about your Bundle Bag, name badge and directory listing.</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/membership" className="rounded-lg bg-blue-900 px-6 py-2.5 font-semibold text-white hover:bg-blue-800">Go to my dashboard</Link>
        <Link href="/events" className="rounded-lg border border-blue-900 px-6 py-2.5 font-semibold text-blue-900 hover:bg-blue-50">See upcoming events</Link>
      </div>
    </div>
  )
}
