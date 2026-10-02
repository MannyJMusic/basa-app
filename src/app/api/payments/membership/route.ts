import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { MEMBERSHIP_SALES_ENABLED, OFFICE_CONTACT } from '@/lib/feature-flags'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { tierFromSlug } from '@/lib/membership-tiers'
import { membershipPurchaseSchema, membershipPurchaseBlock } from '@/lib/membership-purchase'
import { createMembershipCheckout } from '@/lib/membership-billing'
import { hitRateLimit, clientIp } from '@/lib/rate-limit'

const CHECKOUTS_PER_IP = 10
const WINDOW_MS = 10 * 60 * 1000

/**
 * POST /api/payments/membership
 *
 * Starts a Stripe Checkout for a yearly membership subscription and returns its
 * URL. Nothing is granted here: the Stripe webhook (checkout.session.completed)
 * is the only place a purchase becomes a membership (2026-09-22 audit, H-A2).
 */
export async function POST(request: NextRequest) {
  if (!MEMBERSHIP_SALES_ENABLED) {
    return NextResponse.json(
      { error: `Online membership purchase is not available yet. Call ${OFFICE_CONTACT.name} at ${OFFICE_CONTACT.phone} or email ${OFFICE_CONTACT.email}.` },
      { status: 403 },
    )
  }
  if (hitRateLimit(`membership-checkout:${clientIp(request)}`, CHECKOUTS_PER_IP, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes and try again.' }, { status: 429 })
  }

  const parsed = membershipPurchaseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid request' }, { status: 400 })
  }
  const input = parsed.data
  const tier = tierFromSlug(input.tier)
  if (!tier) return NextResponse.json({ error: 'Unknown membership level' }, { status: 400 })

  // Signed in: the membership goes on this account, whatever email the form carried.
  const session = await auth()
  const userId = session?.user?.id ?? null
  let email = input.email
  if (userId) {
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    if (!me?.email) return NextResponse.json({ error: 'Your account has no email address. Contact the office.' }, { status: 400 })
    email = me.email.toLowerCase()
  }

  // Do not let anyone pay twice for a membership that is already running.
  const holder = await prisma.member.findFirst({
    where: userId ? { userId } : { user: { email: { equals: email, mode: 'insensitive' } } },
    select: { membershipStatus: true, subscriptionId: true, renewalDate: true },
  })
  const block = holder ? membershipPurchaseBlock(holder) : null
  if (block) {
    return NextResponse.json(
      { error: userId ? `Your membership is already active. ${block}` : `There is already an active membership for ${email}. Sign in to see it, or contact the office.` },
      { status: 409 },
    )
  }

  const website = input.website && !/^https?:\/\//i.test(input.website) ? `https://${input.website}` : input.website

  try {
    const url = await createMembershipCheckout(
      {
        tier,
        email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        businessName: input.businessName,
        website,
        businessAddress: input.businessAddress,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        showInDirectory: input.showInDirectory,
        showAddress: input.showInDirectory && input.showAddress,
      },
      userId,
    )
    return NextResponse.json({ url })
  } catch (error) {
    Sentry.captureException(error, { tags: { source: 'membership-checkout' } })
    return NextResponse.json(
      { error: `We could not start the payment. Please try again, or call ${OFFICE_CONTACT.name} at ${OFFICE_CONTACT.phone}.` },
      { status: 502 },
    )
  }
}
