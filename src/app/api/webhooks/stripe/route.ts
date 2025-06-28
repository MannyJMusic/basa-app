import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
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
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log('Received webhook event:', event.type)

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

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)
  
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

        await prisma.membership.create({
          data: {
            userId,
            tier: membershipTier,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            autoRenew: false,
            stripeSubscriptionId: null,
            metadata: {
              tierId: item.tierId,
              quantity: item.quantity,
              price: item.price,
              paymentIntentId: paymentIntent.id
            }
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

          // TODO: Send invitation email
          // await sendMembershipInvitation(member.email, member.name, member.tierId)
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
  
  // Handle subscription creation if implementing recurring payments
  const { userId } = subscription.metadata

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        member: {
          update: {
            stripeSubscriptionId: subscription.id,
            membershipStatus: 'ACTIVE'
          }
        }
      }
    })
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
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
  
  const { userId } = subscription.metadata

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        member: {
          update: {
            membershipStatus: 'CANCELLED'
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