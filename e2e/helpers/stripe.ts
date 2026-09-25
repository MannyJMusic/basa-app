import type { APIRequestContext, Page } from '@playwright/test'
import Stripe from 'stripe'
import { assertStripeTestMode } from './env'

// Same pin as src/lib/stripe.ts (STRIPE_API_VERSION); see the note there.
const API_VERSION = '2023-10-16' as unknown as Stripe.LatestApiVersion

/** Stripe's documented test cards. */
export const CARDS = {
  ok: '4242424242424242',
  declined: '4000000000000002',
}

/**
 * Fill Stripe's PaymentElement. It lives in its own iframe; the fields are found
 * by the placeholders Stripe renders. Some Elements configurations also ask for a
 * postal code, so that is filled only when it is present.
 */
export async function fillStripeCard(page: Page, number = CARDS.ok): Promise<void> {
  const frame = page.frameLocator('iframe[title="Secure payment input frame"]').first()
  const cardNumber = frame.getByPlaceholder('1234 1234 1234 1234')
  await cardNumber.waitFor({ state: 'visible', timeout: 30_000 })
  await cardNumber.fill(number)
  await frame.getByPlaceholder('MM / YY').fill('12 / 34')
  await frame.getByPlaceholder('CVC').fill('123')
  // Stripe's US postal code field carries the placeholder "12345".
  const zip = frame.getByPlaceholder('12345')
  if (await zip.count()) await zip.first().fill('78201')
}

/**
 * Deliver the webhook Stripe would send for a PaymentIntent, signed with the
 * secret the app is configured with. Stripe cannot reach a laptop or a CI runner,
 * and the confirmation of a seat or a membership happens in the webhook handler,
 * not in the browser, so the spec plays postman: fetch the real PaymentIntent from
 * Stripe test mode, wrap it in an event, sign it, POST it.
 */
export async function deliverWebhook(
  request: APIRequestContext,
  baseURL: string,
  paymentIntentId: string,
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'payment_intent.canceled' | 'payment_intent.amount_capturable_updated' = 'payment_intent.succeeded',
): Promise<{ status: number; body: string }> {
  const { secretKey, webhookSecret } = assertStripeTestMode()
  const stripe = new Stripe(secretKey, { apiVersion: API_VERSION })
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

  const payload = JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: { object: intent },
  })
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret })

  const res = await request.post(`${baseURL}/api/webhooks/stripe`, {
    data: payload,
    headers: { 'content-type': 'application/json', 'stripe-signature': signature },
  })
  return { status: res.status(), body: await res.text() }
}

/** A Stripe client on the test key, for reading back what the browser created. */
export function stripeTestClient(): Stripe {
  const { secretKey } = assertStripeTestMode()
  return new Stripe(secretKey, { apiVersion: API_VERSION })
}
