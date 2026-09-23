import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { stripe } from '@/lib/stripe'
import { Prisma } from '@prisma/client'
import { handleWebhookEvent } from '@/lib/stripe-webhook-handlers'
import { prisma } from '@/lib/db'

const { logger } = Sentry

export async function POST(request: NextRequest) {
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('❌ Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    logger.warn('Stripe webhook signature verification failed')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }


  // Stripe delivers at least once, so the same event can arrive twice (retries,
  // or two deliveries racing). Claim the event id first; whoever loses the
  // insert acknowledges without doing the work again (2026-09-22 audit, M-A1).
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      logger.info('Duplicate Stripe event ignored', { eventId: event.id, eventType: event.type })
      return NextResponse.json({ received: true, duplicate: true })
    }
    throw error
  }

  try {
    await handleWebhookEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    // Release the claim so Stripe's next retry processes the event.
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => {})
    Sentry.captureException(error, { tags: { source: 'stripe-webhook' } })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
