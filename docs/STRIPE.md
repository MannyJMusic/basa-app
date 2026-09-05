# Stripe

Merges the former `STRIPE_SETUP.md` and `STRIPE_WEBHOOK_TESTING.md`.

## Environment variables

```bash
STRIPE_RESTRICTED_KEY=rk_test_...        # preferred
STRIPE_SECRET_KEY=sk_test_...            # fallback if the restricted key isn't set
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ESSENTIAL_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_CORPORATE_PRICE_ID=price_...
```

`src/lib/stripe.ts` prefers `STRIPE_RESTRICTED_KEY` and falls back to `STRIPE_SECRET_KEY`. The webhook secret and price IDs are required, not optional — the app has webhook handling and tiered membership pricing implemented.

### Creating a restricted key

Dashboard → Developers → API keys → Create restricted key. Grant: Payment Intents (read/write), Customers (read/write), Payment Methods (read/write), Events (read), Webhook Endpoints (read/write). Optional: Charges (read), Refunds (read/write), Disputes (read).

## Local development

```bash
./scripts/dev-with-webhooks.sh
```

This starts `pnpm dev` and `stripe listen --forward-to localhost:3000/api/webhooks/stripe` together (requires the Stripe CLI, `stripe login` once, and `STRIPE_WEBHOOK_SECRET` set from the CLI's printed signing secret). To run them separately instead:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_... into .env.local as STRIPE_WEBHOOK_SECRET, then
pnpm dev
```

### Test cards

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired |

### Triggering events manually

```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Webhook handling

Both `POST /api/webhooks/stripe` (current) and the older `POST /api/payments/webhook` verify the signature and delegate to `handleWebhookEvent` in `src/lib/stripe-webhook-handlers.ts`, which processes: `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.{created,updated,deleted}`, `invoice.payment_{succeeded,failed}`. On success it updates membership status, creates membership records, and sends the welcome/receipt/invitation emails. Errors go to Sentry (`captureException`, tag `source: stripe-webhook`) rather than console output — check Sentry, not server logs, when a webhook fails silently.

### Troubleshooting

- **No events arriving**: confirm `stripe listen` (or `dev-with-webhooks.sh`) is running and forwarding to the right path, and that the dev server is up.
- **Signature verification failed**: `STRIPE_WEBHOOK_SECRET` doesn't match the CLI's current session secret — restart `stripe listen` and copy the new one.
- **500 from the webhook route**: check Sentry for the captured exception; common causes are a stale Prisma client (`pnpm db:generate`) or a missing env var.

## Production

1. Dashboard → Developers → Webhooks → add endpoint `https://app.businessassociationsa.com/api/webhooks/stripe`, subscribed to the event types above.
2. Copy that endpoint's signing secret into the production `STRIPE_WEBHOOK_SECRET`.
3. Switch the three key/price env vars to live-mode values and test with a real card for a small amount before announcing.

## Resources

[API docs](https://docs.stripe.com/api) · [Testing](https://stripe.com/docs/testing) · [Webhook best practices](https://stripe.com/docs/webhooks/best-practices) · [CLI](https://stripe.com/docs/stripe-cli)
