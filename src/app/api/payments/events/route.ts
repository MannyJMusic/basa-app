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

    const isGuest = session?.user?.role === 'GUEST'
    const isMember = ticketType === 'member'

    // Calculate total amount
    let basePrice: number | undefined
    const priceToCharge = isGuest ? event.price : (isMember ? event.memberPrice : event.price)
    if (typeof priceToCharge !== 'number') {
      return NextResponse.json(
        { error: 'Ticket price not available for this event.' },
        { status: 400 }
      )
    }
    const totalAmount = priceToCharge * quantity

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

    // Create event registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: session.user.id,
        name: session.user.name || `${session.user.firstName} ${session.user.lastName}` || 'Unknown',
        email: session.user.email || '',
        ticketCount: quantity,
        totalAmount,
        status: 'CONFIRMED',
        paymentIntentId: paymentIntent.id
      }
    })

    // Log payment
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EVENT_PAYMENT_COMPLETED',
        entityType: 'EVENT_REGISTRATION',
        entityId: registration.id,
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
      registrationId: registration.id,
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