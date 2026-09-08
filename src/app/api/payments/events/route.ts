import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { requireSession, isResponse } from '@/lib/api-auth'
import { priceSelection, TicketAvailabilityError } from '@/lib/ticket-tiers'

const bodySchema = z.object({
  eventId: z.string().min(1),
  items: z
    .array(z.object({ ticketTierId: z.string().min(1), quantity: z.number().int().positive() }))
    .min(1),
  paymentMethod: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (isResponse(session)) return session

  return Sentry.startSpan({ op: 'http.server', name: 'POST /api/payments/events' }, async span => {
    try {
      const body = bodySchema.parse(await request.json())

      // EventRegistration.memberId references Member, not User. Resolving it here
      // rather than passing the user id straight through, which was the previous bug.
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id },
        select: { id: true, membershipStatus: true },
      })
      const isMember = member?.membershipStatus === 'ACTIVE'

      // Prices and availability are settled before any card is touched: charging
      // first and discovering a shortfall afterwards means taking money for a ticket
      // that does not exist.
      const order = await priceSelection(body.eventId, body.items, isMember)

      span.setAttribute('event.id', body.eventId)
      span.setAttribute('tickets.count', order.totalTickets)
      span.setAttribute('order.total_cents', order.totalCents)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalCents,
        currency: 'usd',
        payment_method: body.paymentMethod,
        confirm: true,
        return_url: `${process.env.NEXTAUTH_URL}/payment/success`,
        metadata: {
          userId: session.user.id,
          eventId: body.eventId,
          tickets: order.totalTickets.toString(),
          type: 'event',
        },
      })

      // Registration and its lines are written together: a registration with no
      // lines would hold seats nothing can account for.
      const registration = await prisma.$transaction(async tx => {
        const created = await tx.eventRegistration.create({
          data: {
            eventId: body.eventId,
            memberId: member?.id ?? null,
            name:
              session.user.name ||
              [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') ||
              'Unknown',
            email: session.user.email || '',
            ticketCount: order.totalTickets,
            totalAmount: order.total,
            status: 'CONFIRMED',
            paymentIntentId: paymentIntent.id,
          },
        })

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

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'EVENT_PAYMENT_COMPLETED',
          entityType: 'EVENT_REGISTRATION',
          entityId: registration.id,
          newValues: {
            eventId: body.eventId,
            tickets: order.totalTickets,
            totalAmount: order.total.toString(),
            lines: order.lines.map(l => ({
              tier: l.name,
              quantity: l.quantity,
              unitPrice: l.unitPrice.toString(),
            })),
          },
        },
      })

      return NextResponse.json({
        success: true,
        registrationId: registration.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
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
