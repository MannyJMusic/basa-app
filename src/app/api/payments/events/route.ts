import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { priceSelection, TicketAvailabilityError } from '@/lib/ticket-tiers'

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
    .array(z.object({ ticketTierId: z.string().min(1), quantity: z.number().int().positive() }))
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

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ op: 'http.server', name: 'POST /api/payments/events' }, async span => {
    try {
      const body = bodySchema.parse(await request.json())

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
      })

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

      return NextResponse.json({
        registrationId: registration.id,
        clientSecret: paymentIntent.client_secret,
        // Returned so the client can show what it is about to charge without
        // recomputing prices itself. The server's figure is the only one that counts.
        totalCents: order.totalCents,
        totalTickets: order.totalTickets,
        lines: order.lines.map(l => ({
          ticketTierId: l.ticketTierId,
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice.toString(),
        })),
      })
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
