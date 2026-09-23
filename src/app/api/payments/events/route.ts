import { NextRequest, NextResponse } from 'next/server'
import { newTicketToken } from '@/lib/tickets'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { priceSelection, TicketAvailabilityError } from '@/lib/ticket-tiers'
import { STALE_HOLD_MINUTES } from '@/lib/stale-holds'
import { hitRateLimit, clientIp } from '@/lib/rate-limit'
import { createHash } from 'crypto'

/**
 * Every call holds seats for up to STALE_HOLD_MINUTES before anyone pays, so an
 * unthrottled public route is a free way to sell an event out (2026-09-22 audit,
 * M-A9). One address gets a handful of checkouts per window, and one buyer
 * email a few unpaid holds per event at a time.
 */
const CHECKOUTS_PER_IP = 10
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000
const PENDING_HOLDS_PER_EMAIL = 3

/**
 * Buying a ticket does not require an account.
 *
 * Members buy tickets on the WordPress site today without logging in to basa-app,
 * and the decision is that they never will have to. So this route is public: it
 * takes a buyer's details in the body rather than reading them off a session.
 *
 * A session is still *used* when one happens to exist - to link the registration to
 * a Member and to apply member pricing - but it is never required.
 */

const bodySchema = z.object({
  eventId: z.string().min(1),
  items: z
    .array(z.object({ ticketTierId: z.string().min(1), quantity: z.number().int().positive().max(50) }))
    .min(1)
    .max(20),
  buyer: z.object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    email: z.string().trim().email('A valid email is required').max(320),
    company: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(50).optional(),
  }),
  attendees: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(320).optional(),
      })
    )
    .max(20)
    .optional(),
})

/**
 * The prices come back so the client can show what it is about to charge
 * without recomputing them itself. The server's figure is the only one that counts.
 */
function checkoutResponse(
  registrationId: string,
  clientSecret: string | null,
  order: Awaited<ReturnType<typeof priceSelection>>
) {
  return {
    registrationId,
    clientSecret,
    totalCents: order.totalCents,
    totalTickets: order.totalTickets,
    lines: order.lines.map(l => ({
      ticketTierId: l.ticketTierId,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice.toString(),
    })),
  }
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ op: 'http.server', name: 'POST /api/payments/events' }, async span => {
    try {
      if (hitRateLimit(`event-checkout:${clientIp(request)}`, CHECKOUTS_PER_IP, CHECKOUT_WINDOW_MS)) {
        return NextResponse.json(
          { error: 'Too many checkout attempts. Please wait a few minutes and try again.' },
          { status: 429 }
        )
      }

      const body = bodySchema.parse(await request.json())

      const openHolds = await prisma.eventRegistration.count({
        where: {
          eventId: body.eventId,
          email: { equals: body.buyer.email, mode: 'insensitive' },
          status: 'PENDING',
          createdAt: { gte: new Date(Date.now() - STALE_HOLD_MINUTES * 60 * 1000) },
        },
      })
      if (openHolds >= PENDING_HOLDS_PER_EMAIL) {
        return NextResponse.json(
          { error: 'You already have unfinished checkouts for this event. Complete one, or wait 30 minutes and try again.' },
          { status: 429 }
        )
      }

      // Member status is resolved from the session, never taken from the request.
      // The previous client sent its own `isMember` flag, which would have let
      // anyone claim member pricing by editing one line of JSON.
      const session = await auth()
      const member = session?.user?.id
        ? await prisma.member.findUnique({
            where: { userId: session.user.id },
            select: { id: true, membershipStatus: true },
          })
        : null
      const isMember = member?.membershipStatus === 'ACTIVE'

      // Prices and availability are settled before any card is touched: charging
      // first and discovering a shortfall afterwards means taking money for a
      // ticket that does not exist.
      const order = await priceSelection(body.eventId, body.items, isMember)

      const attendees = body.attendees?.slice(0, order.totalTickets) ?? []

      span.setAttribute('event.id', body.eventId)
      span.setAttribute('tickets.count', order.totalTickets)
      span.setAttribute('order.total_cents', order.totalCents)
      span.setAttribute('buyer.is_member', isMember)

      // Created unconfirmed. The card is confirmed in the browser by Stripe
      // Elements, so card details never reach this server. The old code passed
      // `confirm: true` with a `payment_method` the client had no way to send,
      // which is why this route could never actually complete a purchase.
      //
      // A double-click or client retry sends the same order twice. The
      // idempotency key (same order, same buyer, same minute) makes Stripe hand
      // back the first intent instead of opening a second hold.
      const idempotencyKey = 'event-checkout:' + createHash('sha256')
        .update(JSON.stringify([
          body.eventId,
          body.buyer.email.toLowerCase(),
          order.lines.map(l => [l.ticketTierId, l.quantity]),
          order.totalCents,
          session?.user?.id ?? null,
          Math.floor(Date.now() / 60_000),
        ]))
        .digest('hex')
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        receipt_email: body.buyer.email,
        metadata: {
          type: 'event',
          eventId: body.eventId,
          tickets: order.totalTickets.toString(),
          buyerEmail: body.buyer.email,
          ...(session?.user?.id ? { userId: session.user.id } : {}),
        },
      }, { idempotencyKey })

      // Stripe returned an intent this route already recorded: answer with the
      // existing hold rather than writing a second registration for it.
      const existing = await prisma.eventRegistration.findUnique({
        where: { paymentIntentId: paymentIntent.id },
        select: { id: true, status: true },
      })
      if (existing) {
        if (existing.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'This checkout was already used. Please wait a minute and try again.' },
            { status: 409 }
          )
        }
        return NextResponse.json(checkoutResponse(existing.id, paymentIntent.client_secret, order))
      }

      // PENDING holds the seat while the buyer finishes paying; the Stripe webhook
      // promotes it to CONFIRMED. Writing CONFIRMED here, as the old code did,
      // recorded a paid registration for a card that had not been charged.
      const registration = await prisma.$transaction(async tx => {
        const created = await tx.eventRegistration.create({
          data: {
            eventId: body.eventId,
            memberId: member?.id ?? null,
            name: body.buyer.name,
            email: body.buyer.email,
            company: body.buyer.company ?? null,
            phone: body.buyer.phone ?? null,
            ticketCount: order.totalTickets,
            totalAmount: order.total,
            status: 'PENDING',
            paymentIntentId: paymentIntent.id,
            ticketToken: newTicketToken(),
            attendees: attendees.length ? attendees : undefined,
          },
        })

        // Registration and its lines are written together: a registration with no
        // lines would hold seats nothing can account for.
        await tx.eventRegistrationItem.createMany({
          data: order.lines.map(l => ({
            registrationId: created.id,
            ticketTierId: l.ticketTierId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        })

        return created
      })

      return NextResponse.json(checkoutResponse(registration.id, paymentIntent.client_secret, order))
    } catch (error) {
      // Sold out or closed is the buyer's answer, not a server fault.
      if (error instanceof TicketAvailabilityError) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 })
      }
      Sentry.captureException(error)
      return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
    }
  })
}
