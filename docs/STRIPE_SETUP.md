# Stripe Integration Setup Guide

## 🔑 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
STRIPE_RESTRICTED_KEY=rk_test_your_restricted_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 🛡️ Creating a Restricted API Key

### Step 1: Access Stripe Dashboard
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Login to your Stripe account
3. Switch to **Test Mode** for development

### Step 2: Create Restricted Key
1. Navigate to **Developers** → **API Keys**
2. Click **"Create restricted key"**
3. Name: `BASA Membership Integration`
4. Select the following permissions:

#### Required Permissions:
- ✅ **Payment Intents** (Read, Write)
- ✅ **Customers** (Read, Write)
- ✅ **Payment Methods** (Read, Write)
- ✅ **Events** (Read)
- ✅ **Webhook Endpoints** (Read, Write)

#### Optional Permissions:
- ✅ **Charges** (Read)
- ✅ **Refunds** (Read, Write)
- ✅ **Disputes** (Read)

### Step 3: Copy the Restricted Key
- The restricted key will start with `rk_test_` (test mode) or `rk_live_` (live mode)
- Copy this key and add it to your `.env.local` file

## 🔄 Key Priority System

The integration uses a priority system for API keys:

1. **Primary**: `STRIPE_RESTRICTED_KEY` (recommended for security)
2. **Fallback**: `STRIPE_SECRET_KEY` (if restricted key not available)

```typescript
const stripeKey = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY
```

## 🧪 Testing the Integration

### Test Card Numbers
Use these Stripe test cards for testing:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined payment |
| `4000 0025 0000 3155` | Requires authentication |

### Test Steps
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3000/membership/join`
3. Complete the membership flow
4. Use test card numbers for payment
5. Check Stripe Dashboard for test transactions

## 🔒 Security Best Practices

### 1. Use Restricted Keys
- Always use restricted keys instead of secret keys
- Only grant necessary permissions
- Regularly rotate keys

### 2. Environment Variables
- Never commit API keys to version control
- Use `.env.local` for local development
- Use environment variables in production

### 3. Key Management
- Monitor API usage in Stripe Dashboard
- Set up alerts for unusual activity
- Use different keys for test and live environments

## 🚀 Production Deployment

### 1. Switch to Live Mode
- Update environment variables with live keys
- Test with real cards (small amounts)
- Monitor transactions carefully

### 2. Webhook Setup (Optional)
If implementing webhooks, add:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Subscription Setup (Optional)
If implementing recurring payments, add:
```bash
STRIPE_ESSENTIAL_PRICE_ID=price_your_essential_price_id
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id
STRIPE_CORPORATE_PRICE_ID=price_your_corporate_price_id
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Stripe API key"**
   - Check that environment variables are set
   - Restart development server after adding variables

2. **"Invalid API key"**
   - Verify key format (rk_test_ for restricted, sk_test_ for secret)
   - Ensure key is in correct mode (test/live)

3. **"Payment failed"**
   - Use correct test card numbers
   - Check Stripe Dashboard for error details

4. **"Permission denied"**
   - Verify restricted key has required permissions
   - Check API key is active in Stripe Dashboard

### Debug Steps
1. Check browser console for client-side errors
2. Check server logs for API errors
3. Verify Stripe Dashboard for payment attempts
4. Test with Stripe CLI for detailed error information

## 📚 Additional Resources

- [Stripe API Documentation](https://docs.stripe.com/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks) 