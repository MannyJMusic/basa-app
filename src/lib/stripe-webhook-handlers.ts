import { prisma } from '@/lib/db'
import { sendWelcomeEmail, sendPaymentReceiptEmail, sendMembershipInvitationEmail } from '@/lib/basa-emails'
import { sendWelcomeEmailFallback, sendPaymentReceiptEmailFallback, sendMembershipInvitationEmailFallback } from '@/lib/email-fallback'

/**
 * Stripe webhook event handlers, shared by /api/webhooks/stripe and /api/payments/webhook.
 * Kept out of the route files because Next.js only allows HTTP method exports there.
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('🔔 PAYMENT SUCCEEDED:', paymentIntent.id)
  console.log('📋 Payment metadata:', paymentIntent.metadata)
  
  // Development notification
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 DEV MODE: Processing payment webhook')
    console.log('📧 Email notifications will be sent for this payment')
  }
  
  const { userId, cart, additionalMembers, customerInfo, businessInfo, contactInfo, type, isNewUser } = paymentIntent.metadata

  if (type === 'membership') {
    console.log('Processing membership payment for user:', userId)
    
    // Check if this is a new user signup
    const isNewUserSignup = isNewUser === 'true'
    console.log('Is new user signup:', isNewUserSignup)
    
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
                membershipTier: 'BASIC',
                membershipStatus: 'ACTIVE',
                stripeCustomerId: paymentIntent.customer
              }
            }
          }
        })

        console.log('Updated user record for new user signup')

        // Send welcome email to new user
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { member: true }
        })

        if (user && user.email) {
          console.log('Found user for welcome email:', user.email)
          const activationUrl = user.verificationToken 
            ? `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${user.verificationToken}&email=${user.email}`
            : `${process.env.NEXTAUTH_URL}/auth/sign-in`
          
          const firstName = user.firstName || 'Member'
          
          // Try main email system first, fallback if it fails
          try {
            console.log('Attempting to send welcome email via main system')
            await sendWelcomeEmail(
              user.email,
              firstName,
              activationUrl,
              {
                siteUrl: process.env.NEXTAUTH_URL,
                logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
              }
            )
            console.log(`✅ Welcome email sent successfully to ${user.email}`)
          } catch (emailError) {
            console.log(`❌ Main email system failed, using fallback for ${user.email}:`, emailError)
            try {
              await sendWelcomeEmailFallback(
                user.email,
                firstName,
                activationUrl,
                {
                  siteUrl: process.env.NEXTAUTH_URL,
                  logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
                }
              )
              console.log(`✅ Fallback welcome email sent to ${user.email}`)
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
        console.log('Updated existing user membership')
      }

      // Send payment receipt email to all users
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true }
      })

      if (user && user.email) {
        console.log('Sending payment receipt email to:', user.email)
        
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
          console.log('Attempting to send payment receipt email')
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
          console.log(`✅ Payment receipt email sent successfully to ${user.email}`)
        } catch (emailError) {
          console.error(`❌ Payment receipt email failed:`, emailError)
          console.error(`❌ Email details:`, { userEmail: user.email, paymentId: paymentIntent.id })
          try {
            await sendPaymentReceiptEmailFallback(
              user.email,
              firstName,
              {
                paymentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
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
            console.log(`✅ Fallback payment receipt email sent to ${user.email}`)
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
          console.log('Updated membership tiers based on cart')
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
                console.log('Sending invitation email to additional member:', member.email)
                await sendMembershipInvitationEmail(
                  member.email,
                  member.name,
                  member.tierId,
                  {
                    siteUrl: process.env.NEXTAUTH_URL,
                    logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
                  }
                )
                console.log(`✅ Invitation email sent to ${member.email}`)
              } catch (emailError) {
                console.error(`❌ Failed to send invitation email to ${member.email}:`, emailError)
                try {
                  await sendMembershipInvitationEmailFallback(
                    member.email,
                    member.name,
                    member.tierId,
                    {
                      siteUrl: process.env.NEXTAUTH_URL,
                      logoUrl: `${process.env.NEXTAUTH_URL}/images/BASA-LOGO.png`
                    }
                  )
                  console.log(`✅ Fallback invitation email sent to ${member.email}`)
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
      
      console.log('✅ Payment processing completed successfully')
      
    } catch (error) {
      console.error('❌ Error processing payment success:', error)
      throw error
    }
  } else {
    console.log('Payment type not membership, skipping email processing')
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

export async function handleWebhookEvent(event: any) {
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
