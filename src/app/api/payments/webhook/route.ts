import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // Use the new detailed webhook handlers from the other endpoint
    const { handleWebhookEvent } = await import('../../webhooks/stripe/route')
    await handleWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

// Import the webhook handlers from the new endpoint
async function handleWebhookEvent(event: any) {
  const { prisma } = await import('@/lib/db')
  const { sendWelcomeEmail, sendPaymentReceiptEmail, sendMembershipInvitationEmail } = await import('@/lib/basa-emails')

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)
  
  const { prisma } = await import('@/lib/db')
  const { sendWelcomeEmail, sendPaymentReceiptEmail, sendMembershipInvitationEmail } = await import('@/lib/basa-emails')
  
  const { userId, cart, additionalMembers, customerInfo, businessInfo, contactInfo, type, isNewUser } = paymentIntent.metadata

  if (type === 'membership') {
    // Check if this is a new user signup
    const isNewUserSignup = isNewUser === 'true'
    
    if (isNewUserSignup) {
      // Update the temporary user record with complete information
      const parsedBusinessInfo = businessInfo ? JSON.parse(businessInfo) : {}
      const parsedContactInfo = contactInfo ? JSON.parse(contactInfo) : {}
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: parsedContactInfo.firstName || customerInfo.name.split(' ')[0] || '',
          lastName: parsedContactInfo.lastName || customerInfo.name.split(' ').slice(1).join(' ') || '',
          role: 'MEMBER',
          member: {
            update: {
              businessName: parsedBusinessInfo.businessName || customerInfo.company || 'Business',
              membershipTier: 'BASIC',
              membershipStatus: 'ACTIVE',
              stripeCustomerId: paymentIntent.customer
            }
          }
        }
      })

      // Send welcome email to new user
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { member: true }
        })

        if (user) {
          const activationUrl = user.verificationToken 
            ? `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${user.verificationToken}&email=${user.email || ''}`
            : `${process.env.NEXTAUTH_URL}/auth/sign-in`
          
          const firstName = user.firstName || 'Member'
          
          if (user.email) {
            await sendWelcomeEmail(
              user.email,
              firstName,
              activationUrl,
              {
                siteUrl: process.env.NEXTAUTH_URL,
                logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
              }
            )
          }
          console.log(`Welcome email sent to ${user.email || 'unknown'}`)
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }
    } else {
      // Existing authenticated user - update membership status
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'MEMBER',
          member: {
            upsert: {
              create: {
                membershipTier: 'BASIC',
                membershipStatus: 'ACTIVE',
                joinedAt: new Date(),
                stripeCustomerId: paymentIntent.customer
              },
              update: {
                membershipStatus: 'ACTIVE',
                stripeCustomerId: paymentIntent.customer
              }
            }
          }
        }
      })
    }

    // Send payment receipt email to all users
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true }
      })

      if (user) {
        const parsedCart = cart ? JSON.parse(cart) : []
        const parsedCustomerInfo = customerInfo ? JSON.parse(customerInfo) : {}
        const parsedBusinessInfo = businessInfo ? JSON.parse(businessInfo) : {}
        
        const firstName = user.firstName || parsedCustomerInfo.name?.split(' ')[0] || 'Member'
        
        await sendPaymentReceiptEmail(
          user.email,
          firstName,
          {
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency,
            cart: parsedCart,
            customerInfo: parsedCustomerInfo,
            businessInfo: parsedBusinessInfo,
            paymentDate: new Date().toISOString()
          },
          {
            siteUrl: process.env.NEXTAUTH_URL,
            logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
          }
        )
        console.log(`Payment receipt email sent to ${user.email}`)
      }
    } catch (emailError) {
      console.error('Failed to send payment receipt email:', emailError)
    }

    // Create membership records for each cart item
    if (cart) {
      const cartItems = JSON.parse(cart)
      for (const item of cartItems) {
        const tierMapping: Record<string, 'BASIC' | 'PREMIUM' | 'VIP'> = {
          'meeting-member': 'BASIC',
          'associate-member': 'PREMIUM',
          'trio-member': 'VIP',
          'class-resource-member': 'BASIC',
          'nag-resource-member': 'BASIC',
          'training-resource-member': 'PREMIUM'
        }

        const membershipTier = tierMapping[item.tierId] || 'BASIC'

        // Update member record instead of creating separate membership
        await prisma.member.update({
          where: { userId },
          data: {
            membershipTier: membershipTier,
            membershipStatus: 'ACTIVE'
          }
        })
      }
    }

    // Handle additional members
    if (additionalMembers) {
      const members = JSON.parse(additionalMembers)
      for (const member of members) {
        if (member.sendInvitation) {
          await prisma.membershipInvitation.create({
            data: {
              email: member.email,
              name: member.name,
              tierId: member.tierId,
              invitedBy: userId,
              status: 'PENDING',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              metadata: {
                paymentIntentId: paymentIntent.id
              }
            }
          })

          // Send invitation email to additional members
          try {
            await sendMembershipInvitationEmail(
              member.email,
              member.name,
              member.tierId,
              {
                siteUrl: process.env.NEXTAUTH_URL,
                logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
              }
            )
            console.log(`Invitation email sent to ${member.email}`)
          } catch (emailError) {
            console.error('Failed to send invitation email:', emailError)
          }
        }
      }
    }

    // Log successful payment
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MEMBERSHIP_PAYMENT_COMPLETED',
        entityType: 'PAYMENT',
        entityId: paymentIntent.id,
        newValues: {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          isNewUser: isNewUserSignup
        }
      }
    })
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id)
  
  const { prisma } = await import('@/lib/db')
  const { userId } = paymentIntent.metadata

  if (userId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MEMBERSHIP_PAYMENT_FAILED',
        entityType: 'PAYMENT',
        entityId: paymentIntent.id,
        newValues: {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'failed',
          lastPaymentError: paymentIntent.last_payment_error?.message
        }
      }
    })
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id)
  
  const { prisma } = await import('@/lib/db')
  const { userId } = subscription.metadata

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        member: {
          update: {
            subscriptionId: subscription.id,
            membershipStatus: 'ACTIVE'
          }
        }
      }
    })
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
  const { prisma } = await import('@/lib/db')
  const { userId } = subscription.metadata

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        member: {
          update: {
            membershipStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE'
          }
        }
      }
    })
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id)
  
  const { prisma } = await import('@/lib/db')
  const { userId } = subscription.metadata

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        member: {
          update: {
            membershipStatus: 'INACTIVE'
          }
        }
      }
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  // Handle recurring payment success
  if (invoice.subscription) {
    // Update subscription status or extend membership
    console.log('Recurring payment successful for subscription:', invoice.subscription)
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Invoice payment failed:', invoice.id)
  
  // Handle recurring payment failure
  if (invoice.subscription) {
    console.log('Recurring payment failed for subscription:', invoice.subscription)
  }
} 