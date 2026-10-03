import * as Sentry from '@sentry/nextjs'
import { loadTicket } from '@/lib/tickets'
import { sendEventTicketEmail } from '@/lib/basa-emails'
import { prisma } from '@/lib/db'
import {
  activateMembershipFromCheckout,
  handleMembershipInvoicePaid,
  syncMembershipSubscription,
} from '@/lib/membership-billing'
import { activateMemberRateRequest, cancelMemberRateRequest } from '@/lib/member-rate-requests'

/**
 * Stripe webhook event handlers for /api/webhooks/stripe, which dedupes events
 * by id before calling in. Kept out of the route file because Next.js only
 * allows HTTP method exports there.

 */
const { logger } = Sentry
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  logger.info('Stripe payment succeeded', { paymentIntentId: paymentIntent.id, type: paymentIntent.metadata?.type })

  if (paymentIntent.metadata?.type === 'event') {
    await confirmEventRegistration(paymentIntent)
  }
  // Memberships are Stripe subscriptions bought through Checkout (2026 relaunch) and
  // are granted from checkout.session.completed, not from a PaymentIntent. A
  // subscription's own PaymentIntents carry no `type` and land here harmlessly.
}

/**
 * Promote an event registration from PENDING to CONFIRMED once Stripe says the money
 * actually arrived - or, for a member-rate request, that the card is authorized for
 * it. This is the only place a registration becomes CONFIRMED - the payment route
 * deliberately writes PENDING, because it runs before the card is charged.
 */
export async function confirmEventRegistration(paymentIntent: any) {
  // Looked up by PaymentIntent, which is unique on EventRegistration. Stripe
  // redelivers webhooks, so this has to be safe to run repeatedly.
  const registration = await prisma.eventRegistration.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    select: { id: true, status: true, eventId: true, email: true, ticketCount: true },
  })

  if (!registration) {
    // A succeeded event payment with no registration means the row was never
    // written or was deleted. The buyer has been charged, so this must not pass quietly.
    Sentry.captureMessage('Event payment succeeded with no matching registration', {
      level: 'error',
      tags: { source: 'stripe-webhook', handler: 'payment_intent.succeeded' },
      extra: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount },
    })
    return
  }

  if (registration.status === 'CONFIRMED') {
    logger.info('Event registration already confirmed; ignoring webhook redelivery', {
      registrationId: registration.id,
    })
    return
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: 'CONFIRMED' },
  })

  await prisma.auditLog.create({
    data: {
      action: 'EVENT_PAYMENT_COMPLETED',
      entityType: 'EVENT_REGISTRATION',
      entityId: registration.id,
      newValues: {
        eventId: registration.eventId,
        tickets: registration.ticketCount,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentIntentId: paymentIntent.id,
      },
    },
  })

  logger.info('Event registration confirmed', {
    registrationId: registration.id,
    eventId: registration.eventId,
  })

  // A member-rate request sends its own version of the ticket email (the card is on
  // hold, not charged) and asks the admins to verify the buyer.
  const memberRate = await prisma.memberRateRequest.findUnique({
    where: { registrationId: registration.id },
    select: { id: true },
  })
  if (memberRate) {
    await activateMemberRateRequest(registration.id)
    return
  }

  // The buyer's confirmation, with the ticket link and QR code (#159). A failed
  // send must never fail the webhook: the registration is confirmed regardless,
  // and the ticket page exists whether or not the email lands.
  try {
    const ticket = await loadTicket((await prisma.eventRegistration.findUnique({ where: { id: registration.id }, select: { ticketToken: true } }))?.ticketToken ?? '')
    if (ticket?.ticketToken) {
      await sendEventTicketEmail(ticket)
    } else {
      logger.warn('Confirmed registration has no ticket token; no confirmation email sent', { registrationId: registration.id })
    }
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Failed to send the event ticket email', { registrationId: registration.id })
  }
}

/**
 * Release the seats a PENDING registration was holding when its payment fails or is
 * abandoned. Without this a failed card would hold places against the event's capacity
 * indefinitely, because soldCounts() treats PENDING as holding a seat.
 */
async function releaseEventRegistration(paymentIntent: any, reason: string) {
  const registration = await prisma.eventRegistration.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    select: { id: true, status: true },
  })

  // Only PENDING is released. A CONFIRMED registration whose intent later reports a
  // failure is a refund/dispute question, not something to cancel automatically.
  if (!registration || registration.status !== 'PENDING') return

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: 'CANCELLED' },
  })
  await cancelMemberRateRequest(registration.id)

  logger.info('Event registration released', { registrationId: registration.id, reason })
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  logger.warn('Stripe payment failed', { paymentIntentId: paymentIntent.id })

  if (paymentIntent.metadata?.type === 'event') {
    await releaseEventRegistration(paymentIntent, 'payment_failed')
    return
  }

  const { userId } = paymentIntent.metadata

  if (userId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MEMBERSHIP_PAYMENT_FAILED',
        entityType: 'PAYMENT',
        entityId: paymentIntent.id,
        newValues: {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'failed',
          lastPaymentError: paymentIntent.last_payment_error?.message
        }
      }
    })
  }
}

export async function handleWebhookEvent(event: any) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      // A member-rate request: the card is authorized (manual capture) and the charge
      // waits for an admin, but the seat is the buyer's now.
      case 'payment_intent.amount_capturable_updated':
        if (event.data.object?.metadata?.type === 'event') {
          await confirmEventRegistration(event.data.object)
        }
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      // An abandoned checkout: Stripe cancels the intent rather than failing it, so
      // without this the seats stay held by a PENDING registration nobody will pay for.
      case 'payment_intent.canceled':
        if (event.data.object?.metadata?.type === 'event') {
          await releaseEventRegistration(event.data.object, 'payment_intent.canceled')
        }
        break

      // Memberships (2026 relaunch): see src/lib/membership-billing.ts.
      case 'checkout.session.completed':
        await activateMembershipFromCheckout(event.data.object)
        break

      case 'customer.subscription.updated':
        await syncMembershipSubscription(event.data.object)
        break

      case 'customer.subscription.deleted':
        await syncMembershipSubscription(event.data.object, true)
        break

      case 'invoice.payment_succeeded':
        await handleMembershipInvoicePaid(event.data.object)
        break

      case 'invoice.payment_failed':
        // Stripe retries the card and emails the customer (Billing settings); the
        // membership stays ACTIVE while the subscription is past_due.
        logger.warn('Membership renewal payment failed', { invoiceId: event.data.object?.id, subscription: event.data.object?.subscription })
        break

      default:
        logger.debug('Unhandled Stripe event type', { eventType: event.type })
    }
  } catch (error) {
    Sentry.captureException(error, { tags: { source: 'stripe-webhook' }, extra: { eventType: event?.type, eventId: event?.id } })
    throw error
  }
}
