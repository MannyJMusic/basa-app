/**
 * Online membership billing (2026 relaunch).
 *
 * A membership bought online is a yearly Stripe subscription that renews until the
 * member cancels, which is what the membership contract says. Stripe Checkout takes
 * the payment; the webhook is the only place a membership is granted or extended:
 *
 *   checkout.session.completed      -> activate (create or link the account)
 *   invoice.payment_succeeded       -> a renewal: move renewalDate to the new period end
 *   customer.subscription.updated   -> cancel-at-period-end flag, period end, terminal states
 *   customer.subscription.deleted   -> the subscription has ended: EXPIRED
 *
 * Members billed by the office (imported from the master list) have no
 * subscription; their renewalDate is set by staff and the daily expiry sweep ends
 * them. See src/lib/membership-lifecycle.ts.
 */
import { randomBytes } from 'crypto'
import type Stripe from 'stripe'
import type { MembershipTier } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { SITE_URL } from '@/lib/site-url'
import { MEMBERSHIP_TIERS, tierFromSlug } from '@/lib/membership-tiers'
import { INVITATION_LINK_DAYS, sendMembershipWelcomeEmail } from '@/lib/basa-emails'

const { logger } = Sentry

export const MEMBERSHIP_METADATA_TYPE = 'membership'

/** Stripe lookup key for a level at a price. A new price gets a new key, so existing
 * subscribers keep the rate they joined at (the contract's rate protection). */
export function tierLookupKey(tier: MembershipTier): string {
  const def = MEMBERSHIP_TIERS[tier]
  return `basa_${def.slug}_yearly_${def.priceCents}`
}

const priceCache = new Map<string, string>()

/** The yearly Stripe Price for a level, created on first use. */
export async function ensureTierPrice(tier: MembershipTier): Promise<string> {
  const key = tierLookupKey(tier)
  const cached = priceCache.get(key)
  if (cached) return cached

  const stripe = getStripe()
  const found = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 })
  if (found.data[0]) {
    priceCache.set(key, found.data[0].id)
    return found.data[0].id
  }

  const def = MEMBERSHIP_TIERS[tier]
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: def.priceCents,
    recurring: { interval: 'year' },
    lookup_key: key,
    product_data: { name: `BASA ${def.label}`, metadata: { tier, slug: def.slug } },
    metadata: { tier, slug: def.slug },
  })
  priceCache.set(key, price.id)
  return price.id
}

export interface CheckoutApplicant {
  tier: MembershipTier
  email: string
  firstName: string
  lastName: string
  phone?: string
  businessName: string
  website?: string
  businessAddress?: string
  city?: string
  state?: string
  zipCode?: string
  showInDirectory: boolean
  showAddress: boolean
}

/** What travels from the form to the webhook. Stripe metadata values cap at 500 chars. */
function applicantMetadata(a: CheckoutApplicant, userId: string | null): Record<string, string> {
  const cut = (v: string | undefined, n = 200) => (v ?? '').slice(0, n)
  return {
    type: MEMBERSHIP_METADATA_TYPE,
    tier: a.tier,
    email: cut(a.email.toLowerCase(), 254),
    firstName: cut(a.firstName, 100),
    lastName: cut(a.lastName, 100),
    phone: cut(a.phone, 40),
    businessName: cut(a.businessName),
    website: cut(a.website, 300),
    businessAddress: cut(a.businessAddress),
    city: cut(a.city, 100),
    state: cut(a.state, 40),
    zipCode: cut(a.zipCode, 20),
    showInDirectory: String(a.showInDirectory),
    showAddress: String(a.showAddress),
    ...(userId ? { userId } : {}),
  }
}

async function findOrCreateCustomer(email: string, name: string, phone?: string): Promise<string> {
  const stripe = getStripe()
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data[0]) return existing.data[0].id
  const customer = await stripe.customers.create({ email, name, ...(phone ? { phone } : {}) })
  return customer.id
}

/** Creates the Checkout Session and returns the URL to send the buyer to. */
export async function createMembershipCheckout(applicant: CheckoutApplicant, userId: string | null): Promise<string> {
  const stripe = getStripe()
  const price = await ensureTierPrice(applicant.tier)
  const name = `${applicant.firstName} ${applicant.lastName}`.trim()
  const customer = await findOrCreateCustomer(applicant.email.toLowerCase(), name, applicant.phone)
  const metadata = applicantMetadata(applicant, userId)
  const slug = MEMBERSHIP_TIERS[applicant.tier].slug

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price, quantity: 1 }],
    metadata,
    subscription_data: { metadata: { type: MEMBERSHIP_METADATA_TYPE, tier: applicant.tier, email: metadata.email } },
    ...(userId ? { client_reference_id: userId } : {}),
    billing_address_collection: 'auto',
    allow_promotion_codes: false,
    success_url: `${SITE_URL}/membership/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/membership/join?tier=${slug}&canceled=1`,
  })
  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return session.url
}

const toDate = (unixSeconds: number) => new Date(unixSeconds * 1000)

/**
 * Turns a completed Checkout into an active membership. Idempotent: replaying the
 * same session finds the member by subscription id and changes nothing it should not.
 */
export async function activateMembershipFromCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const md = session.metadata ?? {}
  if (md.type !== MEMBERSHIP_METADATA_TYPE || session.mode !== 'subscription') return
  if (session.payment_status !== 'paid') {
    logger.warn('Membership checkout completed without payment', { sessionId: session.id, status: session.payment_status })
    return
  }

  const tier = (Object.keys(MEMBERSHIP_TIERS) as MembershipTier[]).includes(md.tier as MembershipTier)
    ? (md.tier as MembershipTier)
    : tierFromSlug(md.tier)
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const email = (md.email || session.customer_details?.email || '').toLowerCase()
  if (!tier || !subscriptionId || !email) {
    Sentry.captureMessage('Membership checkout missing tier, subscription or email', { extra: { sessionId: session.id } })
    return
  }

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const renewalDate = toDate((subscription as unknown as { current_period_end: number }).current_period_end)

  // The account: the signed-in buyer's, else the one with this email, else a new one.
  let user = md.userId ? await prisma.user.findUnique({ where: { id: md.userId }, include: { member: true } }) : null
  if (!user) user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, include: { member: true } })

  let createdAccount = false
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        firstName: md.firstName || null,
        lastName: md.lastName || null,
        name: `${md.firstName ?? ''} ${md.lastName ?? ''}`.trim() || null,
        role: 'MEMBER',
        // No password yet: the welcome email carries a set-password link, the same
        // claim flow imported members use (src/lib/account-claim.ts).
        isActive: false,
        accountStatus: 'INACTIVE',
      },
      include: { member: true },
    })
    createdAccount = true
  }

  // Business details from the form fill only what the member record does not have:
  // a returning member's edited profile is never overwritten by a checkout form.
  const existing = user.member
  const fill = <T,>(current: T | null | undefined, incoming: T | undefined) =>
    current !== null && current !== undefined && current !== '' ? current : (incoming || null)

  const membershipFields = {
    membershipTier: tier,
    membershipStatus: 'ACTIVE' as const,
    renewalDate,
    stripeCustomerId: customerId ?? null,
    subscriptionId,
    cancelAtPeriodEnd: false,
    membershipPaymentConfirmed: true,
  }

  // Another member row may hold this Stripe customer from an earlier purchase.
  if (customerId) {
    await prisma.member.updateMany({
      where: { stripeCustomerId: customerId, userId: { not: user.id } },
      data: { stripeCustomerId: null },
    })
  }

  if (existing) {
    await prisma.member.update({
      where: { id: existing.id },
      data: {
        ...membershipFields,
        businessName: fill(existing.businessName, md.businessName),
        businessPhone: fill(existing.businessPhone, md.phone),
        website: fill(existing.website, md.website),
        businessAddress: fill(existing.businessAddress, md.businessAddress),
        city: fill(existing.city, md.city),
        state: fill(existing.state, md.state),
        zipCode: fill(existing.zipCode, md.zipCode),
        // A lapsed member who rejoins starts a new membership.
        ...(existing.membershipStatus !== 'ACTIVE' ? { joinedAt: new Date() } : {}),
      },
    })
  } else {
    await prisma.member.create({
      data: {
        userId: user.id,
        ...membershipFields,
        joinedAt: new Date(),
        businessName: md.businessName || null,
        businessEmail: email,
        businessPhone: md.phone || null,
        website: md.website || null,
        businessAddress: md.businessAddress || null,
        city: md.city || null,
        state: md.state || null,
        zipCode: md.zipCode || null,
        showInDirectory: md.showInDirectory !== 'false',
        showAddress: md.showAddress === 'true',
      },
    })
  }

  // A purchase makes a GUEST a MEMBER and never changes any other role.
  await prisma.user.updateMany({ where: { id: user.id, role: 'GUEST' }, data: { role: 'MEMBER' } })

  await recordMembershipPayment(user.id, session.amount_total ?? MEMBERSHIP_TIERS[tier].priceCents, session.currency ?? 'usd', {
    stripeCustomerId: customerId ?? null,
    stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    metadata: { kind: 'membership', tier, subscriptionId, checkoutSessionId: session.id },
    dedupeKey: session.id,
  })

  // An account nobody can sign in to yet gets a set-password link with the welcome.
  let setupUrl: string | null = null
  const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { hashedPassword: true, accountStatus: true } })
  if (fresh && fresh.hashedPassword === null && fresh.accountStatus === 'INACTIVE') {
    const token = randomBytes(32).toString('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + INVITATION_LINK_DAYS * 24 * 60 * 60 * 1000) },
    })
    setupUrl = `${SITE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}&claim=1`
  }

  try {
    await sendMembershipWelcomeEmail(email, md.firstName || user.firstName || '', {
      tierLabel: MEMBERSHIP_TIERS[tier].label,
      amountCents: session.amount_total ?? MEMBERSHIP_TIERS[tier].priceCents,
      renewalDate,
      setupUrl,
    })
  } catch (error) {
    // The membership is granted either way; a missing email is fixable by staff.
    Sentry.captureException(error, { extra: { sessionId: session.id, createdAccount } })
  }

  logger.info('Membership activated from checkout', { sessionId: session.id, tier, createdAccount })
}

/** A Payment row per paid charge, skipped if this charge was already recorded. */
async function recordMembershipPayment(
  userId: string,
  amountCents: number,
  currency: string,
  opts: { stripeCustomerId: string | null; stripePaymentIntentId: string | null; metadata: Record<string, string>; dedupeKey: string },
) {
  const already = await prisma.payment.findFirst({
    where: { userId, metadata: { path: ['dedupeKey'], equals: opts.dedupeKey } },
    select: { id: true },
  })
  if (already) return
  await prisma.payment.create({
    data: {
      userId,
      amount: amountCents,
      currency,
      status: 'COMPLETED',
      paymentMethod: 'CREDIT_CARD',
      stripeCustomerId: opts.stripeCustomerId,
      stripePaymentIntentId: opts.stripePaymentIntentId,
      metadata: { ...opts.metadata, dedupeKey: opts.dedupeKey },
    },
  })
}

/** A paid invoice on a membership subscription: renewals move the renewal date. */
export async function handleMembershipInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const raw = invoice as unknown as { subscription?: string | { id: string } | null; billing_reason?: string; lines?: { data: Array<{ period?: { end: number } }> } }
  const subscriptionId = typeof raw.subscription === 'string' ? raw.subscription : raw.subscription?.id
  if (!subscriptionId) return
  const member = await prisma.member.findUnique({ where: { subscriptionId }, select: { id: true, userId: true } })
  // The first invoice can arrive before checkout.session.completed; checkout handles that one.
  if (!member) return

  const periodEnd = raw.lines?.data?.[0]?.period?.end
  if (raw.billing_reason !== 'subscription_create' && periodEnd) {
    await prisma.member.update({
      where: { id: member.id },
      data: { membershipStatus: 'ACTIVE', renewalDate: toDate(periodEnd) },
    })
  }
  if (raw.billing_reason !== 'subscription_create') {
    await recordMembershipPayment(member.userId, invoice.amount_paid, invoice.currency, {
      stripeCustomerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null,
      stripePaymentIntentId: typeof (invoice as unknown as { payment_intent?: string }).payment_intent === 'string'
        ? (invoice as unknown as { payment_intent: string }).payment_intent
        : null,
      metadata: { kind: 'membership_renewal', subscriptionId, invoiceId: invoice.id ?? '' },
      dedupeKey: invoice.id ?? `${subscriptionId}-${periodEnd}`,
    })
  }
}

/** Keeps the member row in step with the subscription. */
export async function syncMembershipSubscription(subscription: Stripe.Subscription, deleted = false): Promise<void> {
  const member = await prisma.member.findUnique({ where: { subscriptionId: subscription.id }, select: { id: true } })
  if (!member) return
  const sub = subscription as unknown as { status: string; cancel_at_period_end: boolean; current_period_end: number }

  if (deleted || ['canceled', 'unpaid', 'incomplete_expired'].includes(sub.status)) {
    await prisma.member.update({
      where: { id: member.id },
      data: { membershipStatus: 'EXPIRED', cancelAtPeriodEnd: false },
    })
    return
  }
  // active, trialing or past_due (Stripe is retrying the card): still a member.
  await prisma.member.update({
    where: { id: member.id },
    data: {
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      ...(sub.status === 'active' ? { renewalDate: toDate(sub.current_period_end), membershipStatus: 'ACTIVE' as const } : {}),
    },
  })
}

/**
 * The Stripe-hosted page where a member updates their card, sees invoices, or
 * cancels. Created on first use with cancellation at period end, so cancelling
 * never cuts short a year the member has paid for.
 */
async function portalConfigurationId(): Promise<string> {
  const stripe = getStripe()
  const list = await stripe.billingPortal.configurations.list({ is_default: true, active: true, limit: 1 })
  if (list.data[0]) return list.data[0].id
  const created = await stripe.billingPortal.configurations.create({
    business_profile: { headline: 'Business Association of San Antonio membership' },
    default_return_url: `${SITE_URL}/dashboard/membership`,
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ['email', 'address', 'phone', 'name'] },
      subscription_cancel: { enabled: true, mode: 'at_period_end', cancellation_reason: { enabled: true, options: ['too_expensive', 'unused', 'other'] } },
    },
  })
  return created.id
}

export async function createBillingPortalUrl(stripeCustomerId: string): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    configuration: await portalConfigurationId(),
    return_url: `${SITE_URL}/dashboard/membership`,
  })
  return session.url
}
