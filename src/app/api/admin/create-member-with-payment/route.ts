import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/site-url'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendAdminCreatedWelcomeEmail, sendPaymentReceiptEmail } from '@/lib/basa-emails'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { tierFromSlug, tierPriceCents } from '@/lib/membership-tiers'
import { z } from 'zod'

// Unknown keys are dropped rather than rejected: the admin form posts its whole
// state (phone, billing info) and only these fields are used.
const bodySchema = z.object({
  memberData: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    businessName: z.string().trim().max(200).optional(),
    membershipTier: z.string().refine(slug => tierFromSlug(slug) !== undefined, 'Unknown membership tier'),
    role: z.enum(['MEMBER', 'MODERATOR', 'ADMIN']).default('MEMBER'),
  }),
  paymentData: z.object({
    method: z.enum(['credit_card', 'cash', 'check']),
    clientSecret: z.string().max(300).optional(),
    checkNumber: z.string().trim().max(50).optional(),
    cashAmount: z.number().min(0).max(100000).optional(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Missing required member information' },
        { status: 400 }
      )
    }
    const { memberData, paymentData } = parsed.data
    // What the tier costs, from the server's table. Recorded payments use this,
    // not an amount from the request (2026-09-22 audit, M-A4).
    const tierPrice = tierPriceCents(memberData.membershipTier)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: memberData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    

    // A card payment is checked before anything is written, so a bad one leaves
    // no half-created account behind. Only an admin-created intent, paid in full
    // for this tier, and not already recorded against another member, counts.
    let paymentIntent: Awaited<ReturnType<typeof stripe.paymentIntents.retrieve>> | null = null
    if (paymentData.method === 'credit_card' && paymentData.clientSecret) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentData.clientSecret.split('_secret_')[0])
      const alreadyRecorded = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        select: { id: true },
      })
      if (
        paymentIntent.metadata?.admin_created !== 'true' ||
        paymentIntent.amount < tierPrice ||
        alreadyRecorded
      ) {
        return NextResponse.json(
          { error: 'That payment cannot be used for this membership' },
          { status: 400 }
        )
      }
    }

    // Generate random password and verification token
    const randomPassword = randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
    const hashedPassword = await hash(randomPassword, 12)
    const verificationToken = randomBytes(32).toString('hex')

    // Create user and member records
    const user = await prisma.user.create({
      data: {
        email: memberData.email,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        role: memberData.role,
        hashedPassword: hashedPassword,
        emailVerified: null,
        verificationToken: verificationToken,
        resetToken: null,
        resetTokenExpiry: null,
        // phone field removed - not in User model
        isActive: true, // Admin-created members should be active immediately
        member: {
          create: {
            businessName: memberData.businessName || '',
            membershipTier: tierFromSlug(memberData.membershipTier) ?? 'MEETING_MEMBER',
            membershipStatus: 'PENDING',
            joinedAt: new Date()
          }
        }
      },
      include: {
        member: true
      }
    })

    // Handle payment processing
    let paymentRecord = null
    let stripeCustomerId = null

    if (paymentIntent) {
      try {
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Update member status to active
          await prisma.member.update({
            where: { userId: user.id },
            data: {
              membershipStatus: 'ACTIVE',
              stripeCustomerId: paymentIntent.customer as string
            }
          })

          // Create payment record
          paymentRecord = await prisma.payment.create({
            data: {
              userId: user.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: 'COMPLETED',
              paymentMethod: 'CREDIT_CARD',
              stripePaymentIntentId: paymentIntent.id,
              stripeCustomerId: paymentIntent.customer as string,
              metadata: {
                admin_created: true,
                admin_id: session.user.id,
                membership_tier: memberData.membershipTier
              }
            }
          })

          stripeCustomerId = paymentIntent.customer as string
        }
      } catch (error) {
        console.error('Error processing credit card payment:', error)
        return NextResponse.json(
          { error: 'Failed to process credit card payment' },
          { status: 500 }
        )
      }
    } else if (paymentData.method === 'cash' || paymentData.method === 'check') {
      // For cash/check payments, create payment record directly
      const amount = tierPrice

      paymentRecord = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: amount,
          currency: 'usd',
          status: 'COMPLETED',
          paymentMethod: paymentData.method === 'cash' ? 'CASH' : 'CHECK',
          metadata: {
            admin_created: true,
            admin_id: session.user.id,
            membership_tier: memberData.membershipTier,
            check_number: paymentData.checkNumber,
            cash_amount_received: paymentData.cashAmount
          }
        }
      })

      // Update member status to active for cash/check payments
      await prisma.member.update({
        where: { userId: user.id },
        data: {
          membershipStatus: 'ACTIVE'
        }
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MEMBER_CREATED_BY_ADMIN',
        entityType: 'MEMBER',
        entityId: user.id || '',
        oldValues: {},
        newValues: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          membershipTier: memberData.membershipTier,
          paymentMethod: paymentData.method,
          admin_id: session.user.id
        }
      }
    })

    // Send welcome email with generated password
    try {
      // Get the correct site URL based on environment
      const siteUrl = SITE_URL
      const activationUrl = `${siteUrl}/auth/verify-email?token=${verificationToken}&email=${user.email}`
      
      await sendAdminCreatedWelcomeEmail(
        user.email!,
        user.firstName || 'Member',
        randomPassword,
        activationUrl,
        {
          siteUrl: siteUrl,
          logoUrl: `${siteUrl}/images/BASA-LOGO.png`,
          fromName: 'BASA Admin'
        }
      )
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the entire operation if email fails
    }

    // Send payment receipt email
    if (paymentRecord) {
      try {
        const membershipTier = MEMBERSHIP_TIERS[memberData.membershipTier as keyof typeof MEMBERSHIP_TIERS]
        // Get the correct site URL based on environment
        const siteUrl = SITE_URL
        
        await sendPaymentReceiptEmail(
          user.email!,
          user.firstName || 'Member',
          {
            paymentId: paymentRecord.id,
            amount: paymentRecord.amount / 100, // Convert from cents
            currency: paymentRecord.currency,
            cart: [{
              tierId: memberData.membershipTier,
              quantity: 1,
              price: membershipTier.price,
              name: membershipTier.name
            }],
            customerInfo: {
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'BASA Member',
              email: user.email!
            },
            businessInfo: {
              businessName: user.member?.businessName || ''
            },
            paymentDate: new Date().toISOString()
          },
          {
            siteUrl: siteUrl,
            logoUrl: `${siteUrl}/images/BASA-LOGO.png`,
            fromName: 'BASA Admin'
          }
        )
      } catch (receiptError) {
        console.error('Failed to send payment receipt email:', receiptError)
        // Don't fail the entire operation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipStatus: user.member?.membershipStatus
      },
      payment: paymentRecord ? {
        id: paymentRecord.id,
        amount: paymentRecord.amount / 100,
        method: paymentRecord.paymentMethod
      } : null
    })

  } catch (error) {
    console.error('Error creating member with payment:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}

// Membership pricing structure (for reference)
const MEMBERSHIP_TIERS = {
  'meeting-member': {
    name: 'Meeting Member',
    price: 149
  },
  'associate-member': {
    name: 'Associate Member',
    price: 245
  },
  'trio-member': {
    name: 'TRIO Member',
    price: 295
  },
  'class-resource-member': {
    name: 'Class Resource Member',
    price: 120
  },
  'nag-resource-member': {
    name: 'NAG Resource Member',
    price: 0
  },
  'training-resource-member': {
    name: 'Training Resource Member',
    price: 225
  }
} 