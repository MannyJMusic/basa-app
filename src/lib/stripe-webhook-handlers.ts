import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import {
  sendWelcomeEmail,
  sendPaymentReceiptEmail,
  sendMembershipInvitationEmail,
  sendWelcomeEmailFallback,
  sendPaymentReceiptEmailFallback,
  sendMembershipInvitationEmailFallback,
} from '@/lib/basa-emails'
import { tierFromSlug } from '@/lib/membership-tiers'
import { renewalDateForPayment } from '@/lib/membership-lifecycle'

/**
 * Stripe webhook event handlers, shared by /api/webhooks/stripe and /api/payments/webhook.
 * Kept out of the route files because Next.js only allows HTTP method exports there.

 */
const { logger } = Sentry
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  logger.info('Stripe payment succeeded', { paymentIntentId: paymentIntent.id, type: paymentIntent.metadata?.type })
  
  // Development notification
  if (process.env.NODE_ENV === 'development') {
  }
  
  const { userId, cart, additionalMembers, customerInfo, businessInfo, contactInfo, type, isNewUser } = paymentIntent.metadata

  if (type === 'membership') {
    
    // Check if this is a new user signup
    const isNewUserSignup = isNewUser === 'true'
    
    try {
      if (isNewUserSignup) {
        // Parse metadata safely
        let parsedBusinessInfo: any = {}
        let parsedContactInfo: any = {}
        
        try {
          parsedBusinessInfo = businessInfo ? JSON.parse(businessInfo) : {}
          parsedContactInfo = contactInfo ? JSON.parse(contactInfo) : {}
        } catch (parseError) {
          console.error('Failed to parse metadata:', parseError)
          // Use fallback values
          parsedBusinessInfo = { businessName: 'Business' }
          parsedContactInfo = { firstName: 'Member', lastName: '' }
        }
        
        // Update the temporary user record with complete information
        await prisma.user.update({
          where: { id: userId },
          data: {
            firstName: parsedContactInfo.firstName || customerInfo?.name?.split(' ')[0] || 'Member',
            lastName: parsedContactInfo.lastName || customerInfo?.name?.split(' ').slice(1).join(' ') || '',
            role: 'MEMBER',
            member: {
              update: {
                businessName: parsedBusinessInfo.businessName || customerInfo?.company || 'Business',
                membershipTier: 'MEETING_MEMBER',
                membershipStatus: 'ACTIVE',
                renewalDate: renewalDateForPayment(),
                stripeCustomerId: paymentIntent.customer
              }
            }
          }
        })


        // Send welcome email to new user
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { member: true }
        })

        if (user && user.email) {
          const activationUrl = user.verificationToken 
            ? `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${user.verificationToken}&email=${user.email}`
            : `${process.env.NEXTAUTH_URL}/auth/sign-in`
          
          const firstName = user.firstName || 'Member'
          
          // Try main email system first, fallback if it fails
          try {
            await sendWelcomeEmail(
              user.email,
              firstName,
              activationUrl,
              {
                siteUrl: process.env.NEXTAUTH_URL,
                logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
              }
            )
          } catch (emailError) {
            try {
              await sendWelcomeEmailFallback(user.email, firstName, activationUrl)
            } catch (fallbackError) {
              console.error('❌ Both email systems failed:', fallbackError)
            }
          }
        } else {
          console.error('❌ User not found for welcome email:', userId)
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
                  membershipTier: 'MEETING_MEMBER',
                  membershipStatus: 'ACTIVE',
                  joinedAt: new Date(),
                  renewalDate: renewalDateForPayment(),
                  stripeCustomerId: paymentIntent.customer
                },
                update: {
                  membershipStatus: 'ACTIVE',
                  renewalDate: renewalDateForPayment(),
                  stripeCustomerId: paymentIntent.customer
                }
              }
            }
          }
        })
      }

      // Send payment receipt email to all users
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true }
      })

      if (user && user.email) {
        
        // Parse cart and other data safely
        let parsedCart: any[] = []
        let parsedCustomerInfo: any = {}
        let parsedBusinessInfo: any = {}
        
        try {
          parsedCart = cart ? JSON.parse(cart) : []
          parsedCustomerInfo = customerInfo ? JSON.parse(customerInfo) : {}
          parsedBusinessInfo = businessInfo ? JSON.parse(businessInfo) : {}
        } catch (parseError) {
          console.error('Failed to parse payment data:', parseError)
        }
        
        const firstName = user.firstName || parsedCustomerInfo.name?.split(' ')[0] || 'Member'
        
        try {
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
        } catch (emailError) {
          console.error(`❌ Payment receipt email failed:`, emailError)
          console.error(`❌ Email details:`, { userEmail: user.email, paymentId: paymentIntent.id })
          try {
            await sendPaymentReceiptEmailFallback(user.email, firstName, {
              paymentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
            })
          } catch (fallbackError) {
            console.error('❌ Both payment receipt email systems failed:', fallbackError)
          }
        }
      } else {
        console.error('❌ User not found for payment receipt email:', userId)
      }

      // Create membership records for each cart item
      if (cart) {
        try {
          const cartItems = JSON.parse(cart)
          for (const item of cartItems) {
            const membershipTier = tierFromSlug(item.tierId) ?? 'MEETING_MEMBER'

            // Update member record instead of creating separate membership
            await prisma.member.update({
              where: { userId },
              data: {
                membershipTier: membershipTier,
                membershipStatus: 'ACTIVE',
                renewalDate: renewalDateForPayment()
              }
            })
          }
        } catch (parseError) {
          console.error('Failed to parse cart for membership tiers:', parseError)
        }
      }

      // Handle additional members
      if (additionalMembers) {
        try {
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
              } catch (emailError) {
                console.error(`❌ Failed to send invitation email to ${member.email}:`, emailError)
                try {
                  await sendMembershipInvitationEmailFallback(member.email, member.name, member.tierId)
                } catch (fallbackError) {
                  console.error(`❌ Both invitation email systems failed for ${member.email}:`, fallbackError)
                }
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse additional members:', parseError)
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
      
      
    } catch (error) {
      Sentry.captureException(error, { tags: { source: 'stripe-webhook', handler: 'payment_intent.succeeded' } })
      throw error
    }
  } else if (type === 'event') {
    await confirmEventRegistration(paymentIntent)
  }
}

/**
 * Promote an event registration from PENDING to CONFIRMED once Stripe says the money
 * actually arrived. This is the only place a registration becomes CONFIRMED - the
 * payment route deliberately writes PENDING, because it runs before the card is charged.
 */
async function confirmEventRegistration(paymentIntent: any) {
  // Looked up by PaymentIntent, which is unique on EventRegistration. Stripe
  // redelivers webhooks, so this has to be safe to run repeatedly.
  const registration = await prisma.eventRegistration.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    select: { id: true, status: true, eventId: true, email: true, ticketCount: true },
  })

  if (!registration) {
    // A succeeded event payment with no registration means the row was never
    // written or was deleted. The buyer has been charged, so this must not pass quietly.
    Sentry.captureMessage('Event payment succeeded with no matching registration', {
      level: 'error',
      tags: { source: 'stripe-webhook', handler: 'payment_intent.succeeded' },
      extra: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount },
    })
    return
  }

  if (registration.status === 'CONFIRMED') {
    logger.info('Event registration already confirmed; ignoring webhook redelivery', {
      registrationId: registration.id,
    })
    return
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: 'CONFIRMED' },
  })

  await prisma.auditLog.create({
    data: {
      action: 'EVENT_PAYMENT_COMPLETED',
      entityType: 'EVENT_REGISTRATION',
      entityId: registration.id,
      newValues: {
        eventId: registration.eventId,
        tickets: registration.ticketCount,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentIntentId: paymentIntent.id,
      },
    },
  })

  logger.info('Event registration confirmed', {
    registrationId: registration.id,
    eventId: registration.eventId,
  })
}

/**
 * Release the seats a PENDING registration was holding when its payment fails or is
 * abandoned. Without this a failed card would hold places against the event's capacity
 * indefinitely, because soldCounts() treats PENDING as holding a seat.
 */
async function releaseEventRegistration(paymentIntent: any, reason: string) {
  const registration = await prisma.eventRegistration.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    select: { id: true, status: true },
  })

  // Only PENDING is released. A CONFIRMED registration whose intent later reports a
  // failure is a refund/dispute question, not something to cancel automatically.
  if (!registration || registration.status !== 'PENDING') return

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: 'CANCELLED' },
  })

  logger.info('Event registration released', { registrationId: registration.id, reason })
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  logger.warn('Stripe payment failed', { paymentIntentId: paymentIntent.id })

  if (paymentIntent.metadata?.type === 'event') {
    await releaseEventRegistration(paymentIntent, 'payment_failed')
    return
  }

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
  
  // Handle subscription creation if implementing recurring payments
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
  
  // Handle recurring payment success
  if (invoice.subscription) {
    // Update subscription status or extend membership
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  
  // Handle recurring payment failure
  if (invoice.subscription) {
  }
}

export async function handleWebhookEvent(event: any) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      // An abandoned checkout: Stripe cancels the intent rather than failing it, so
      // without this the seats stay held by a PENDING registration nobody will pay for.
      case 'payment_intent.canceled':
        if (event.data.object?.metadata?.type === 'event') {
          await releaseEventRegistration(event.data.object, 'payment_intent.canceled')
        }
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
        logger.debug('Unhandled Stripe event type', { eventType: event.type })
    }
  } catch (error) {
    Sentry.captureException(error, { tags: { source: 'stripe-webhook' }, extra: { eventType: event?.type, eventId: event?.id } })
    throw error
  }
}
