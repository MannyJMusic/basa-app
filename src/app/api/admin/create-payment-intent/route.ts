import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, email, metadata } = body

    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Amount and email are required' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let customer
    const existingCustomer = await prisma.user.findUnique({
      where: { email },
      include: { member: true }
    })

    if (existingCustomer?.member?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingCustomer.member.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: {
          source: 'admin_created',
          admin_id: session.user.id
        }
      })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        admin_created: 'true',
        admin_id: session.user.id
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 