# Stripe Webhook Testing Guide

This guide explains how to test Stripe webhooks while developing locally.

## 🚀 Quick Start

### 1. Install Stripe CLI

**Windows (Chocolatey):**
```bash
choco install stripe-cli
```

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

### 4. Add Webhook Secret to Environment
Copy the webhook secret and add it to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

### 5. Start Your Development Server
```bash
npm run dev
# or
pnpm dev
```

## 🧪 Testing Webhooks

### Test Payment Success
1. Go to your membership join page
2. Complete a test payment using Stripe test cards
3. Watch the CLI output for webhook events
4. Check your server logs for webhook processing

### Test Payment Failure
Use these test card numbers to simulate failures:
- **Card declined:** `4000000000000002`
- **Insufficient funds:** `4000000000009995`
- **Expired card:** `4000000000000069`

### Manual Webhook Testing
You can trigger webhook events manually:

```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test payment failure
stripe trigger payment_intent.payment_failed

# Test subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Test invoice events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## 🔍 Monitoring Webhooks

### CLI Output
The Stripe CLI shows real-time webhook events:
```
2024-01-15 10:30:45   --> payment_intent.succeeded [evt_1234...]
2024-01-15 10:30:45  <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_1234...]
```

### Server Logs
Check your Next.js server logs for webhook processing:
```
Received webhook event: payment_intent.succeeded
Payment succeeded: pi_1234567890abcdef...
```

### Database Changes
After successful webhook processing, check your database:
- User role updated to 'MEMBER'
- Membership records created
- Audit logs added

## 🛠️ Troubleshooting

### Webhook Not Receiving Events
1. **Check CLI is running:** Ensure `stripe listen` is active
2. **Verify endpoint URL:** Should be `localhost:3000/api/webhooks/stripe`
3. **Check server is running:** Your Next.js app must be running
4. **Verify webhook secret:** Ensure `STRIPE_WEBHOOK_SECRET` is set correctly

### Signature Verification Failed
```
Webhook signature verification failed: Invalid signature
```
- Check that `STRIPE_WEBHOOK_SECRET` matches the CLI output
- Ensure the secret is copied exactly (no extra spaces)

### 500 Errors
Check your server logs for:
- Database connection issues
- Missing environment variables
- Prisma schema mismatches

### Common Issues

**"Missing stripe-signature header"**
- Ensure you're using the correct webhook endpoint
- Check that Stripe CLI is forwarding to the right URL

**"Invalid signature"**
- Verify the webhook secret is correct
- Restart the CLI and copy the new secret

**Database errors**
- Run `npx prisma generate` to update Prisma client
- Check that all required database tables exist
- Verify database connection string

## 📊 Webhook Event Types

Our webhook handler processes these events:

### Payment Events
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed

### Subscription Events (for future use)
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription cancelled

### Invoice Events (for recurring payments)
- `invoice.payment_succeeded` - Recurring payment successful
- `invoice.payment_failed` - Recurring payment failed

## 🔒 Security Best Practices

1. **Always verify webhook signatures** - Our handler does this automatically
2. **Use restricted API keys** - Limit permissions for webhook processing
3. **Log all webhook events** - For debugging and audit trails
4. **Handle idempotency** - Webhooks may be sent multiple times
5. **Validate event data** - Check that required fields exist

## 🚀 Production Deployment

When deploying to production:

1. **Create webhook endpoint in Stripe Dashboard**
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Get production webhook secret**
   - Copy the signing secret from the webhook endpoint
   - Add to production environment variables

3. **Test production webhooks**
   - Use Stripe Dashboard to send test events
   - Monitor logs for successful processing

## 📝 Example Webhook Flow

1. **User completes payment** on membership join page
2. **Stripe processes payment** and creates payment intent
3. **Stripe sends webhook** to your endpoint
4. **Your webhook handler:**
   - Verifies signature
   - Updates user membership status
   - Creates membership records
   - Handles additional members
   - Logs audit trail
5. **User receives confirmation** and access to member features

## 🔧 Development Tips

- **Keep CLI running** in a separate terminal window
- **Use test cards** for different scenarios
- **Monitor logs** in real-time
- **Test error scenarios** with declined cards
- **Verify database changes** after each test
- **Use Stripe Dashboard** to view test data

## 📚 Additional Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)
- [Webhook Event Reference](https://stripe.com/docs/api/events) 