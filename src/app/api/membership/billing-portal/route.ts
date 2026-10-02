import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { requireSession, isResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { createBillingPortalUrl } from '@/lib/membership-billing'
import { SITE_URL } from '@/lib/site-url'

/**
 * POST /api/membership/billing-portal (a plain form post from My Membership)
 * Sends an online member to Stripe's billing portal for their own customer record:
 * card, invoices, cancellation. Office-billed members have nothing to manage there.
 */
export async function POST() {
  const session = await requireSession()
  if (isResponse(session)) return session

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true, subscriptionId: true },
  })
  if (!member?.stripeCustomerId || !member.subscriptionId) {
    return NextResponse.redirect(`${SITE_URL}/dashboard/membership?billing=office`, 303)
  }
  try {
    const url = await createBillingPortalUrl(member.stripeCustomerId)
    return NextResponse.redirect(url, 303)
  } catch (error) {
    Sentry.captureException(error, { tags: { source: 'billing-portal' } })
    return NextResponse.redirect(`${SITE_URL}/dashboard/membership?billing=unavailable`, 303)
  }
}
