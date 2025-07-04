import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { MEMBERSHIP_PRICES } from '@/lib/stripe'

interface CartItem {
  tierId: string
  quantity: number
  price: number
  name: string
}

interface AdditionalMember {
  id: string
  name: string
  email: string
  tierId: string
  sendInvitation: boolean
}

interface PaymentRequest {
  cart: CartItem[]
  additionalMembers: AdditionalMember[]
  customerInfo: {
    name: string
    email: string
    company: string
    phone: string
  }
  autoRenew: boolean
  businessInfo?: {
    businessName: string
  }
  contactInfo?: {
    firstName: string
    lastName: string
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    console.log('=== Membership Payment API Called ===')
    
    const session = await auth()
    console.log('Session:', session ? 'Authenticated' : 'Not authenticated')
    console.log('Auth time:', Date.now() - startTime, 'ms')
    
    const body: PaymentRequest = await request.json()
    console.log('Request body received:', JSON.stringify(body, null, 2))
    
    const { cart, additionalMembers, customerInfo, autoRenew, businessInfo, contactInfo } = body

    // Validate cart
    if (!cart || cart.length === 0) {
      console.log('Validation failed: No cart items')
      return NextResponse.json(
        { error: 'No memberships selected' },
        { status: 400 }
      )
    }

    // Validate customer info
    if (!customerInfo?.email || !customerInfo.email.includes('@')) {
      console.log('Validation failed: Invalid email')
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    if (!customerInfo?.name || customerInfo.name.trim().length < 2) {
      console.log('Validation failed: Invalid name')
      return NextResponse.json(
        { error: 'Valid name is required' },
        { status: 400 }
      )
    }

    console.log('Validation passed, proceeding with payment creation...')

    // Calculate total amount
    const totalAmount = cart.reduce((sum, item) => {
      const priceInCents = MEMBERSHIP_PRICES[item.tierId as keyof typeof MEMBERSHIP_PRICES] || 0
      return sum + (priceInCents * item.quantity)
    }, 0)

    if (totalAmount === 0) {
      return NextResponse.json(
        { error: 'Invalid cart total' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let customer
    try {
      const existingCustomer = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1
      })

      if (existingCustomer.data.length > 0) {
        customer = existingCustomer.data[0]
      } else {
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          metadata: {
            company: customerInfo.company
          }
        })
      }
    } catch (stripeError: any) {
      console.error('Stripe customer creation error:', stripeError)
      if (stripeError.code === 'email_invalid') {
        return NextResponse.json(
          { error: 'Please enter a valid email address' },
          { status: 400 }
        )
      }
      throw stripeError
    }

    let userId: string

    if (session?.user) {
      // Authenticated user - use existing user ID
      userId = session.user.id
    } else {
      // Unauthenticated user - check if user exists, otherwise create
      let tempUser = await prisma.user.findUnique({
        where: { email: customerInfo.email }
      })
      if (!tempUser) {
        tempUser = await prisma.user.create({
          data: {
            email: customerInfo.email,
            firstName: contactInfo?.firstName || customerInfo.name.split(' ')[0] || '',
            lastName: contactInfo?.lastName || customerInfo.name.split(' ').slice(1).join(' ') || '',
            role: 'GUEST',
            emailVerified: null,
            verificationToken: null,
            resetToken: null,
            resetTokenExpiry: null,
            member: {
              create: {
                businessName: businessInfo?.businessName || customerInfo.company || 'Temporary Business',
                membershipTier: 'BASIC',
                membershipStatus: 'ACTIVE',
                joinedAt: new Date(),
                stripeCustomerId: customer.id
              }
            }
          }
        })
      }
      userId = tempUser.id
    }

    // Create payment intent
    console.log('Creating Stripe payment intent...')
    const stripeStartTime = Date.now()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        cart: JSON.stringify(cart),
        additionalMembers: JSON.stringify(additionalMembers),
        customerInfo: JSON.stringify(customerInfo),
        businessInfo: JSON.stringify(businessInfo || {}),
        contactInfo: JSON.stringify(contactInfo || {}),
        autoRenew: autoRenew.toString(),
        type: 'membership',
        isNewUser: (!session?.user).toString()
      }
    })
    console.log('Stripe payment intent created in:', Date.now() - stripeStartTime, 'ms')

    // If authenticated user, update their membership immediately
    if (session?.user) {
      console.log('Updating user membership...')
      const dbStartTime = Date.now()
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: 'MEMBER',
          member: {
            upsert: {
              create: {
                membershipTier: 'BASIC', // Default tier, will be updated based on cart
                membershipStatus: 'ACTIVE',
                joinedAt: new Date(),
                stripeCustomerId: customer.id
              },
              update: {
                membershipStatus: 'ACTIVE',
                stripeCustomerId: customer.id
              }
            }
          }
        }
      })
      console.log('User membership updated in:', Date.now() - dbStartTime, 'ms')

      // Create membership records for each cart item
      for (const item of cart) {
        // Map tier ID to membership tier enum
        const tierMapping: Record<string, 'BASIC' | 'PREMIUM' | 'VIP'> = {
          'meeting-member': 'BASIC',
          'associate-member': 'PREMIUM',
          'trio-member': 'VIP',
          'class-resource-member': 'BASIC',
          'nag-resource-member': 'BASIC',
          'training-resource-member': 'PREMIUM'
        }

        const membershipTier = tierMapping[item.tierId] || 'BASIC'

        // Update member record with tier information
        await prisma.member.update({
          where: { userId: session.user.id },
          data: {
            membershipTier: membershipTier,
            membershipStatus: 'ACTIVE'
          }
        })
      }

      // Handle additional members
      if (additionalMembers.length > 0) {
        for (const member of additionalMembers) {
          if (member.sendInvitation) {
            // Create invitation record using MembershipInvitation model
            await prisma.membershipInvitation.create({
              data: {
                email: member.email,
                name: member.name,
                tierId: member.tierId,
                invitedBy: session.user.id,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                metadata: {
                  paymentIntentId: paymentIntent.id
                }
              }
            })

            // TODO: Send invitation email
            // await sendMembershipInvitation(member.email, member.name, member.tierId)
          }
        }
      }

      // Log payment
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'MEMBERSHIP_PAYMENT_COMPLETED',
          entityType: 'PAYMENT',
          entityId: paymentIntent.id,
          newValues: {
            cart: JSON.stringify(cart),
            additionalMembers: JSON.stringify(additionalMembers),
            totalAmount,
            currency: 'usd',
            autoRenew
          }
        }
      })
    }

    console.log('Total API execution time:', Date.now() - startTime, 'ms')
    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    })

  } catch (error: any) {
    console.error('=== Membership Payment Error ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error object:', error)
    
    return NextResponse.json(
      { error: 'Payment failed', details: error.message },
      { status: 500 }
    )
  }
} 