import { NextRequest, NextResponse } from 'next/server'
import { MEMBERSHIP_SALES_ENABLED, OFFICE_CONTACT } from '@/lib/feature-flags'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { MEMBERSHIP_PRICES } from '@/lib/stripe'
import { z } from 'zod'

// The body is client-controlled. Unknown keys inside the nested objects are
// dropped rather than rejected: the join wizard posts its whole form state, and
// only the fields below are used (and fit in Stripe's 500-char metadata values).
const paymentRequestSchema = z.object({
  cart: z
    .array(
      z.object({
        tierId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(20),
        name: z.string().max(200).optional(),
      })
    )
    .min(1, 'No memberships selected')
    .max(10),
  additionalMembers: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(254),
        tierId: z.string().min(1).max(64),
        sendInvitation: z.boolean().default(false),
      })
    )
    .max(20)
    .default([]),
  customerInfo: z.object({
    name: z.string().trim().min(2, 'Valid name is required').max(200),
    email: z.string().trim().email('Valid email address is required').max(254),
    company: z.string().trim().max(200).optional().default(''),
    phone: z.string().trim().max(40).optional().default(''),
  }),
  autoRenew: z.boolean().default(false),
  businessInfo: z.object({ businessName: z.string().trim().max(200).optional() }).optional(),
  contactInfo: z
    .object({
      firstName: z.string().trim().max(100).optional(),
      lastName: z.string().trim().max(100).optional(),
    })
    .optional(),
}).strict()

export async function POST(request: NextRequest) {
  if (!MEMBERSHIP_SALES_ENABLED) {
    return NextResponse.json(
      { error: `Online membership purchase is not available yet. Call ${OFFICE_CONTACT.name} at ${OFFICE_CONTACT.phone} or email ${OFFICE_CONTACT.email}.` },
      { status: 403 }
    )
  }
  try {
    
    const session = await auth()
    
    const parsed = paymentRequestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }
    const { cart, additionalMembers, customerInfo, autoRenew, businessInfo, contactInfo } = parsed.data

    // Prices come from the server's tier table, never from the client's cart.
    if (cart.some(item => !Object.prototype.hasOwnProperty.call(MEMBERSHIP_PRICES, item.tierId))) {
      return NextResponse.json({ error: 'Unknown membership tier' }, { status: 400 })
    }
    const totalAmount = cart.reduce(
      (sum, item) => sum + MEMBERSHIP_PRICES[item.tierId] * item.quantity,
      0
    )

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

    // Nothing here grants anything: this runs before the card is charged. The
    // Stripe webhook (payment_intent.succeeded) is the only place a purchase
    // becomes a membership (2026-09-22 audit, H-A2).
    let userId: string
    // True only when this request created the account, so the webhook may fill
    // in its name. An existing account found by email is never renamed.
    let isNewUser = false

    if (session?.user) {
      userId = session.user.id
    } else {
      let tempUser = await prisma.user.findUnique({
        where: { email: customerInfo.email }
      })
      if (!tempUser) {
        isNewUser = true
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
                membershipTier: 'MEETING_MEMBER',
                membershipStatus: 'PENDING',
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
        isNewUser: isNewUser.toString()
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
      { error: 'Payment failed' },
      { status: 500 }
    )
  }
} 