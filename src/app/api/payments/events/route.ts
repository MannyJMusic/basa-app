import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { eventId, ticketType, quantity, paymentMethod } = body

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Calculate total amount
    const ticketPricing = {
      general: event.generalPrice,
      vip: event.vipPrice,
      early_bird: event.earlyBirdPrice
    }

    const basePrice = ticketPricing[ticketType as keyof typeof ticketPricing] || event.generalPrice
    const totalAmount = basePrice * quantity

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentMethod,
      confirm: true,
      return_url: `${process.env.NEXTAUTH_URL}/payment/success`,
      metadata: {
        userId: session.user.id,
        eventId,
        ticketType,
        quantity: quantity.toString(),
        type: 'event'
      }
    })

    // Create ticket registration
    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        userId: session.user.id,
        ticketType,
        quantity,
        totalAmount,
        status: 'CONFIRMED',
        stripePaymentIntentId: paymentIntent.id
      }
    })

    // Log payment
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EVENT_PAYMENT_COMPLETED',
        entityType: 'TICKET',
        entityId: ticket.id,
        newValues: {
          eventId,
          ticketType,
          quantity,
          totalAmount
        }
      }
    })

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    })

  } catch (error: any) {
    console.error('Event payment error:', error)
    
    return NextResponse.json(
      { error: 'Payment failed', details: error.message },
      { status: 500 }
    )
  }
} 