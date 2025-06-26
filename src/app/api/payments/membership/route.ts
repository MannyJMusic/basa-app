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
    const { tier, paymentMethod } = body

    // Validate tier and map to MembershipTier enum
    const tierMapping = {
      essential: 'BASIC',
      professional: 'PREMIUM', 
      corporate: 'VIP'
    }
    
    if (!tierMapping[tier as keyof typeof tierMapping]) {
      return NextResponse.json(
        { error: 'Invalid membership tier' },
        { status: 400 }
      )
    }

    const membershipTier = tierMapping[tier as keyof typeof tierMapping] as 'BASIC' | 'PREMIUM' | 'VIP'

    // Get tier pricing
    const tierPricing = {
      essential: 20000, // $200 in cents
      professional: 40000, // $400 in cents
      corporate: 75000 // $750 in cents
    }

    const amount = tierPricing[tier as keyof typeof tierPricing]

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethod,
      confirm: true,
      return_url: `${process.env.NEXTAUTH_URL}/payment/success`,
      metadata: {
        userId: session.user.id,
        tier,
        type: 'membership'
      }
    })

    // Update user membership
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'MEMBER',
        member: {
          upsert: {
            create: {
              membershipTier,
              membershipStatus: 'ACTIVE',
              joinedAt: new Date(),
              stripeCustomerId: paymentIntent.customer as string || undefined
            },
            update: {
              membershipTier,
              membershipStatus: 'ACTIVE',
              joinedAt: new Date(),
              stripeCustomerId: paymentIntent.customer as string || undefined
            }
          }
        }
      }
    })

    // Log payment
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MEMBERSHIP_PAYMENT_COMPLETED',
        entityType: 'PAYMENT',
        entityId: paymentIntent.id,
        newValues: {
          tier,
          membershipTier,
          amount,
          currency: 'usd'
        }
      }
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    })

  } catch (error: any) {
    console.error('Membership payment error:', error)
    
    return NextResponse.json(
      { error: 'Payment failed', details: error.message },
      { status: 500 }
    )
  }
} 