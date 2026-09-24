import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { confirmEventRegistration } from '@/lib/stripe-webhook-handlers'
import { cancelMemberRateRequest } from '@/lib/member-rate-requests'

const { logger } = Sentry

/** How long a PENDING registration may hold its seats before the sweep looks at it. */
export const STALE_HOLD_MINUTES = 30

/** PaymentIntent statuses Stripe lets us cancel: the buyer never completed payment. */
const CANCELABLE = new Set(['requires_payment_method', 'requires_confirmation', 'requires_action'])

export interface StaleHoldSweepResult {
  examined: number
  released: number
  confirmed: number
  stillProcessing: number
  failed: number
}

/**
 * Release seats held by abandoned checkouts (#160).
 *
 * The payment route writes a PENDING registration before the card is charged so
 * the seats are held while the buyer types. If they walk away, nothing ever fires
 * a webhook and the hold lasts forever. Every PENDING registration older than
 * STALE_HOLD_MINUTES is checked against Stripe, the source of truth:
 *
 *   - succeeded          -> the webhook was missed; confirm it (and send the ticket)
 *   - processing         -> leave it; Stripe has not decided yet
 *   - cancelable         -> cancel the PaymentIntent and mark the registration CANCELLED
 *   - already canceled   -> mark it CANCELLED
 *   - anything else      -> log and leave it for a person
 *
 * Idempotent: a registration that is no longer PENDING is skipped.
 */
export async function releaseStaleHolds(now: Date = new Date(), olderThanMinutes = STALE_HOLD_MINUTES): Promise<StaleHoldSweepResult> {
  const cutoff = new Date(now.getTime() - olderThanMinutes * 60_000)
  const stale = await prisma.eventRegistration.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    select: { id: true, paymentIntentId: true, eventId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })

  const result: StaleHoldSweepResult = { examined: stale.length, released: 0, confirmed: 0, stillProcessing: 0, failed: 0 }
  if (stale.length === 0) return result
  const stripe = getStripe()

  for (const reg of stale) {
    try {
      if (!reg.paymentIntentId) {
        // Never reached Stripe at all; nothing to cancel.
        await release(reg.id, 'no payment intent')
        result.released++
        continue
      }

      const intent = await stripe.paymentIntents.retrieve(reg.paymentIntentId)

      // requires_capture is a member-rate request whose card is authorized: the
      // seat is the buyer's, and the charge waits for an admin's decision.
      if (intent.status === 'succeeded' || intent.status === 'requires_capture') {
        await confirmEventRegistration(intent)
        result.confirmed++
        logger.warn('Stale hold was actually paid or authorized; confirmed by the sweep (webhook missed?)', { registrationId: reg.id, status: intent.status })
        continue
      }
      if (intent.status === 'processing') {
        result.stillProcessing++
        continue
      }
      if (CANCELABLE.has(intent.status)) {
        await stripe.paymentIntents.cancel(intent.id, { cancellation_reason: 'abandoned' })
      } else if (intent.status !== 'canceled') {
        logger.warn('Stale hold has an unexpected PaymentIntent status; left alone', { registrationId: reg.id, status: intent.status })
        result.failed++
        continue
      }
      await release(reg.id, `abandoned checkout (${intent.status})`)
      result.released++
    } catch (error) {
      result.failed++
      Sentry.captureException(error, { extra: { registrationId: reg.id, paymentIntentId: reg.paymentIntentId } })
    }
  }
  return result
}

async function release(id: string, reason: string): Promise<void> {
  // Re-check under the update so a webhook that confirmed it a moment ago wins.
  const updated = await prisma.eventRegistration.updateMany({
    where: { id, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  })
  if (updated.count === 1) {
    await cancelMemberRateRequest(id)
    logger.info('Stale registration hold released', { registrationId: id, reason })
  }
}
