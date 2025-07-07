import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendAdminCreatedWelcomeEmail, sendPaymentReceiptEmail } from '@/lib/basa-emails'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'

// Membership tier mapping
const TIER_MAPPING: Record<string, 'BASIC' | 'PREMIUM' | 'VIP'> = {
  'meeting-member': 'BASIC',
  'associate-member': 'PREMIUM',
  'trio-member': 'VIP',
  'class-resource-member': 'BASIC',
  'nag-resource-member': 'BASIC',
  'training-resource-member': 'PREMIUM'
}

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
    console.log('Received request body:', JSON.stringify(body, null, 2))
    const { memberData, paymentData } = body

    // Validate member data
    console.log('Validating member data:', {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email
    })
    
    if (!memberData.firstName || !memberData.lastName || !memberData.email) {
      console.log('Validation failed: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required member information' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', memberData.email)
    const existingUser = await prisma.user.findUnique({
      where: { email: memberData.email }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    console.log('No existing user found, proceeding with creation')

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
        phone: memberData.phone || null,
        isActive: true, // Admin-created members should be active immediately
        member: {
          create: {
            businessName: memberData.businessName || '',
            membershipTier: TIER_MAPPING[memberData.membershipTier] || 'BASIC',
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

    if (paymentData.method === 'credit_card' && paymentData.clientSecret) {
      // For credit card payments, verify the payment intent
      try {
        // Extract payment intent ID from client secret
        const paymentIntentId = paymentData.clientSecret.split('_secret_')[0]
        
        // Retrieve the payment intent directly
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        
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
      const amount = paymentData.method === 'cash' 
        ? (paymentData.cashAmount || 0) * 100 // Convert to cents
        : paymentData.amount

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
        entityId: user.member?.id || '',
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
      const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const activationUrl = `${siteUrl}/auth/verify-email?token=${verificationToken}&email=${user.email}`
      
      await sendAdminCreatedWelcomeEmail(
        user.email,
        user.firstName,
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
        const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        
        await sendPaymentReceiptEmail(
          user.email,
          user.firstName,
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
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
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
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
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