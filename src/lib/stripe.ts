import Stripe from 'stripe'

// Initialize Stripe with restricted key (preferred) or fallback to secret key
const stripeKey = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY

if (!stripeKey) {
  throw new Error('Missing Stripe API key. Please set STRIPE_RESTRICTED_KEY or STRIPE_SECRET_KEY environment variable.')
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
})

// Stripe publishable key for client-side
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}

// Membership pricing structure (in cents)
export const MEMBERSHIP_PRICES = {
  'meeting-member': 0, // $0/year (included)
  'associate-member': 15000, // $150/year
  'trio-member': 30000, // $300/year
  'class-resource-member': 0, // $0/year (included)
  'nag-resource-member': 0, // $0/year (included)
  'training-resource-member': 22500, // $225/year
  // Add the tier keys that are being referenced
  'essential': 0, // $0/year (included)
  'professional': 15000, // $150/year
  'corporate': 30000, // $300/year
}

// Event pricing structure
export const EVENT_PRICING = {
  member: 2500, // $25 for members
  nonMember: 5000, // $50 for non-members
  groupDiscount: 0.15, // 15% discount for groups of 3+
}

// Create a payment intent for membership
export async function createMembershipPaymentIntent(
  tier: 'essential' | 'professional' | 'corporate',
  customerId?: string,
  metadata?: Record<string, string>
) {
  const amount = MEMBERSHIP_PRICES[tier]
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    metadata: {
      type: 'membership',
      tier,
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

// Create a payment intent for event tickets
export async function createEventPaymentIntent(
  eventId: string,
  ticketCount: number,
  isMember: boolean,
  customerId?: string,
  metadata?: Record<string, string>
) {
  const basePrice = isMember ? EVENT_PRICING.member : EVENT_PRICING.nonMember
  let totalAmount = basePrice * ticketCount

  // Apply group discount for 3+ tickets
  if (ticketCount >= 3) {
    totalAmount = totalAmount * (1 - EVENT_PRICING.groupDiscount)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount),
    currency: 'usd',
    customer: customerId,
    metadata: {
      type: 'event_ticket',
      eventId,
      ticketCount: ticketCount.toString(),
      isMember: isMember.toString(),
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

// Create a customer in Stripe
export async function createStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })

  return customer
}

// Create a subscription for recurring membership
export async function createMembershipSubscription(
  customerId: string,
  tier: 'essential' | 'professional' | 'corporate',
  metadata?: Record<string, string>
) {
  // You'll need to create these price IDs in your Stripe dashboard
  const priceIds = {
    essential: process.env.STRIPE_ESSENTIAL_PRICE_ID!,
    professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    corporate: process.env.STRIPE_CORPORATE_PRICE_ID!,
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceIds[tier] }],
    metadata: {
      type: 'membership_subscription',
      tier,
      ...metadata,
    },
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })

  return subscription
}

// Handle webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      await handleSubscriptionPayment(invoice)
      break
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCancellation(subscription)
      break
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { type, tier, eventId, ticketCount, isMember } = paymentIntent.metadata

  if (type === 'membership') {
    // Update user membership in database
    // await updateUserMembership(paymentIntent.customer as string, tier)
    console.log(`Membership payment successful for tier: ${tier}`)
  } else if (type === 'event_ticket') {
    // Create event tickets in database
    // await createEventTickets(paymentIntent.customer as string, eventId, ticketCount)
    console.log(`Event ticket payment successful for event: ${eventId}`)
  }
}

// Handle subscription payment
async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  // Handle recurring membership payment
  console.log(`Subscription payment successful for customer: ${invoice.customer}`)
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  // Update user membership status
  console.log(`Subscription cancelled for customer: ${subscription.customer}`)
}

// Format amount for display
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

// Calculate event ticket price with discounts
export function calculateEventPrice(
  ticketCount: number,
  isMember: boolean,
  basePrice?: number
): {
  pricePerTicket: number
  totalPrice: number
  discount: number
  discountPercentage: number
} {
  const memberPrice = basePrice || EVENT_PRICING.member
  const nonMemberPrice = basePrice ? basePrice * 2 : EVENT_PRICING.nonMember
  const pricePerTicket = isMember ? memberPrice : nonMemberPrice
  let totalPrice = pricePerTicket * ticketCount
  let discount = 0
  let discountPercentage = 0

  // Apply group discount for 3+ tickets
  if (ticketCount >= 3) {
    discount = totalPrice * EVENT_PRICING.groupDiscount
    totalPrice = totalPrice - discount
    discountPercentage = EVENT_PRICING.groupDiscount * 100
  }

  return {
    pricePerTicket,
    totalPrice,
    discount,
    discountPercentage,
  }
} 