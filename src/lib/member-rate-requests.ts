import * as Sentry from '@sentry/nextjs'
import type { MembershipTier } from '@prisma/client'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { loadTicket, ticketUrl } from '@/lib/tickets'
import { sendEventTicketEmail, sendMemberRateDecisionEmail, sendMemberRateRequestAdminEmail } from '@/lib/basa-emails'

const { logger } = Sentry

/**
 * Member-rate verification.
 *
 * A guest who says they are a BASA member buys the member tier, but the card is
 * only authorized (capture_method: manual) for the order at non-member prices.
 * An admin then approves - capture the member total, the rest of the hold drops
 * off - or denies - capture the full hold. Card authorizations lapse after seven
 * days, so an undecided request is captured in full at DECISION_DAYS.
 */
export const DECISION_DAYS = 6

export type MemberRateDecision = 'approve' | 'deny'

export class MemberRateRequestError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message)
    this.name = 'MemberRateRequestError'
    // tsconfig targets ES5; without this `instanceof` fails (see TicketAvailabilityError).
    Object.setPrototypeOf(this, MemberRateRequestError.prototype)
  }
}

async function activeAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    // Same rule as sign-in: anyone who could sign in and decide gets the email.
    where: { role: 'ADMIN', isActive: true, accountStatus: { notIn: ['SUSPENDED', 'INACTIVE'] } },
    select: { email: true },
  })
  return admins.map(a => a.email).filter((e): e is string => Boolean(e))
}

/**
 * The card is authorized: the seat is the buyer's, so the ticket goes out now with
 * the hold explained, and the admins are asked to verify. Runs from the webhook and
 * the stale-hold sweep, so it has to be safe to call more than once: only the call
 * that moves the request out of AWAITING_PAYMENT sends anything.
 */
export async function activateMemberRateRequest(registrationId: string, now: Date = new Date()): Promise<boolean> {
  const deadlineAt = new Date(now.getTime() + DECISION_DAYS * 24 * 60 * 60 * 1000)
  const claimed = await prisma.memberRateRequest.updateMany({
    where: { registrationId, status: 'AWAITING_PAYMENT' },
    data: { status: 'PENDING', authorizedAt: now, deadlineAt },
  })
  if (claimed.count !== 1) return false

  const request = await prisma.memberRateRequest.findUnique({
    where: { registrationId },
    include: { registration: { include: { event: { select: { title: true } } } } },
  })
  if (!request) return false
  const reg = request.registration

  try {
    const ticket = reg.ticketToken ? await loadTicket(reg.ticketToken) : null
    if (ticket) {
      await sendEventTicketEmail(ticket, {
        pendingMemberRate: { heldCents: request.heldCents, memberCents: request.memberCents, deadlineAt },
      })
    }
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Failed to send the pending-member-rate ticket email', { registrationId })
  }

  try {
    const admins = await activeAdminEmails()
    if (!admins.length) {
      Sentry.captureMessage('Member-rate request has no active admin to notify', { level: 'error', extra: { requestId: request.id } })
    } else {
      await sendMemberRateRequestAdminEmail(admins, {
        requestId: request.id,
        buyerName: reg.name,
        buyerEmail: reg.email,
        company: reg.company,
        phone: reg.phone,
        eventTitle: reg.event.title,
        tickets: reg.ticketCount,
        heldCents: request.heldCents,
        memberCents: request.memberCents,
        deadlineAt,
      })
    }
  } catch (error) {
    // The request is still listed in the admin area; a lost email must not lose it.
    Sentry.captureException(error)
    logger.error('Failed to email admins about a member-rate request', { requestId: request.id })
  }

  logger.info('Member-rate request awaiting verification', { requestId: request.id, registrationId })
  return true
}

/** Checkout abandoned or the card failed: nothing was charged, nothing to decide. */
export async function cancelMemberRateRequest(registrationId: string): Promise<void> {
  await prisma.memberRateRequest.updateMany({
    where: { registrationId, status: { in: ['AWAITING_PAYMENT', 'PENDING'] } },
    data: { status: 'CANCELLED' },
  })
}

type Outcome = 'APPROVED' | 'DENIED' | 'EXPIRED'

/**
 * Settle a PENDING request: capture the member total (APPROVED) or the full hold
 * (DENIED, EXPIRED). The row is claimed with a conditional update first, so two
 * admins clicking at once, or an admin racing the deadline sweep, capture once.
 * If Stripe refuses, the claim is undone and the request stays PENDING.
 */
async function settle(requestId: string, outcome: Outcome, by: { userId?: string; note?: string } = {}) {
  const claimed = await prisma.memberRateRequest.updateMany({
    where: { id: requestId, status: 'PENDING' },
    data: { status: outcome, decidedAt: new Date(), decidedById: by.userId ?? null, decisionNote: by.note ?? null },
  })
  if (claimed.count !== 1) {
    const current = await prisma.memberRateRequest.findUnique({ where: { id: requestId }, select: { status: true } })
    if (!current) throw new MemberRateRequestError('Request not found', 404)
    throw new MemberRateRequestError(`This request was already ${current.status.toLowerCase().replace('_', ' ')}`)
  }

  const request = await prisma.memberRateRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: {
      registration: {
        include: { items: { include: { ticketTier: { select: { nonMemberTierId: true } } } }, event: { select: { title: true } } },
      },
    },
  })
  const reg = request.registration
  const chargeCents = outcome === 'APPROVED' ? request.memberCents : request.heldCents

  try {
    if (!reg.paymentIntentId) throw new MemberRateRequestError('This registration has no payment to settle')
    const intent = await stripe.paymentIntents.retrieve(reg.paymentIntentId)
    if (intent.status !== 'requires_capture') {
      throw new MemberRateRequestError(`The card hold is no longer open (Stripe status: ${intent.status}). Settle it in the Stripe dashboard.`)
    }
    if (chargeCents === 0) {
      // A free member rate: nothing to take, so release the whole hold.
      await stripe.paymentIntents.cancel(intent.id, { cancellation_reason: 'requested_by_customer' }, { idempotencyKey: `mrr-settle:${requestId}` })
    } else {
      await stripe.paymentIntents.capture(intent.id, { amount_to_capture: chargeCents }, { idempotencyKey: `mrr-settle:${requestId}` })
    }
  } catch (error) {
    await prisma.memberRateRequest.update({
      where: { id: requestId },
      data: { status: 'PENDING', decidedAt: null, decidedById: null, decisionNote: null },
    })
    if (error instanceof MemberRateRequestError) throw error
    Sentry.captureException(error, { extra: { requestId } })
    throw new MemberRateRequestError('Stripe could not settle the card hold. Nothing was charged; try again.', 502)
  }

  // The registration now records what was actually charged. Approved: the member
  // price. Otherwise the ticket is a non-member ticket, so it moves to the paired
  // tier where one is still set, and keeps the held price.
  await prisma.$transaction(async tx => {
    for (const item of reg.items) {
      if (item.memberUnitPrice === null) continue
      await tx.eventRegistrationItem.update({
        where: { id: item.id },
        data: outcome === 'APPROVED'
          ? { unitPrice: item.memberUnitPrice }
          : item.ticketTier.nonMemberTierId ? { ticketTierId: item.ticketTier.nonMemberTierId } : {},
      })
    }
    await tx.eventRegistration.update({ where: { id: reg.id }, data: { totalAmount: chargeCents / 100 } })
    await tx.memberRateRequest.update({ where: { id: requestId }, data: { chargedCents: chargeCents } })
    await tx.auditLog.create({
      data: {
        userId: by.userId ?? null,
        action: `MEMBER_RATE_${outcome}`,
        entityType: 'EVENT_REGISTRATION',
        entityId: reg.id,
        newValues: { requestId, chargedCents: chargeCents, heldCents: request.heldCents, memberCents: request.memberCents },
      },
    })
  })

  try {
    await sendMemberRateDecisionEmail(reg.email, {
      buyerName: reg.name,
      eventTitle: reg.event.title,
      outcome,
      chargedCents: chargeCents,
      ticketLink: reg.ticketToken ? ticketUrl(reg.ticketToken) : null,
    })
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Failed to send the member-rate decision email', { requestId })
  }

  logger.info('Member-rate request settled', { requestId, outcome, chargedCents: chargeCents })
  return { outcome, chargedCents: chargeCents }
}

export interface MarkMemberOptions {
  tier?: MembershipTier | null
  /** Defaults to a year from now. */
  renewalDate?: Date
}

export type MarkMemberOutcome =
  | { status: 'activated' | 'created' | 'already_active'; userId: string; memberId: string }
  | { status: 'failed'; reason: string }

/**
 * Approve and remember: the verified buyer becomes an active member, so next time
 * they sign in they get the member rate without asking. Keyed on the buyer's email.
 * An existing account and membership are updated; with no account, one is created
 * in the unclaimed state (no password, INACTIVE) that the invitations page and
 * "Forgot password" both handle. An already-active membership is left as it is.
 * The registration is linked to the membership either way.
 */
export async function makeBuyerAMember(requestId: string, adminUserId: string, opts: MarkMemberOptions = {}): Promise<MarkMemberOutcome> {
  const request = await prisma.memberRateRequest.findUnique({
    where: { id: requestId },
    select: { registration: { select: { id: true, name: true, email: true, company: true, phone: true } } },
  })
  if (!request) return { status: 'failed', reason: 'Request not found' }
  const reg = request.registration
  const email = reg.email.trim().toLowerCase()
  const renewalDate = opts.renewalDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  return prisma.$transaction(async tx => {
    let user = await tx.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, include: { member: true } })
    let status: 'activated' | 'created' | 'already_active' = 'activated'
    if (!user) {
      const [firstName, ...rest] = reg.name.trim().split(/\s+/)
      user = await tx.user.create({
        data: { email, firstName: firstName || null, lastName: rest.join(' ') || null, name: reg.name.trim() || null, role: 'GUEST', isActive: false, accountStatus: 'INACTIVE' },
        include: { member: true },
      })
      status = 'created'
    }

    let memberId: string
    if (user.member?.membershipStatus === 'ACTIVE') {
      memberId = user.member.id
      status = 'already_active'
    } else if (user.member) {
      memberId = (await tx.member.update({
        where: { id: user.member.id },
        data: { membershipStatus: 'ACTIVE', renewalDate, ...(opts.tier ? { membershipTier: opts.tier } : {}) },
      })).id
    } else {
      memberId = (await tx.member.create({
        data: {
          userId: user.id, membershipStatus: 'ACTIVE', renewalDate, membershipTier: opts.tier ?? null,
          businessName: reg.company, businessPhone: reg.phone, showInDirectory: false, newsletterSubscribed: false,
        },
      })).id
    }

    await tx.eventRegistration.update({ where: { id: reg.id }, data: { memberId } })
    if (status !== 'already_active') {
      await tx.auditLog.create({
        data: {
          userId: adminUserId, action: 'MEMBERSHIP_ACTIVATED_MANUALLY', entityType: 'MEMBER', entityId: memberId,
          newValues: { email, membershipStatus: 'ACTIVE', renewalDate: renewalDate.toISOString(), tier: opts.tier ?? null, reason: `verified through member-rate request ${requestId}` },
        },
      })
    }
    return { status, userId: user.id, memberId }
  })
}

export async function decideMemberRateRequest(
  requestId: string,
  decision: MemberRateDecision,
  adminUserId: string,
  note?: string,
  markMember?: MarkMemberOptions | null
) {
  const settled = await settle(requestId, decision === 'approve' ? 'APPROVED' : 'DENIED', { userId: adminUserId, note })
  if (decision !== 'approve' || !markMember) return { ...settled, membership: null }
  // The charge has happened; a problem recording the membership must not undo it
  // or hide it. It is reported, and an admin can set the membership by hand.
  let membership: MarkMemberOutcome
  try {
    membership = await makeBuyerAMember(requestId, adminUserId, markMember)
  } catch (error) {
    Sentry.captureException(error, { extra: { requestId } })
    membership = { status: 'failed', reason: 'The membership could not be recorded' }
  }
  return { ...settled, membership }
}

/**
 * Charge the non-member rate for every request nobody decided in time. Runs from
 * the stale-hold cron (every 15 minutes), well inside the seven-day card hold.
 */
export async function expireMemberRateRequests(now: Date = new Date()) {
  const due = await prisma.memberRateRequest.findMany({
    where: { status: 'PENDING', deadlineAt: { lt: now } },
    select: { id: true },
  })
  let expired = 0
  let failed = 0
  for (const r of due) {
    try {
      await settle(r.id, 'EXPIRED')
      expired++
    } catch (error) {
      failed++
      Sentry.captureException(error, { extra: { requestId: r.id } })
    }
  }
  return { expired, failed }
}
