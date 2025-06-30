#!/usr/bin/env node

/**
 * Manual webhook testing script
 * This simulates Stripe webhook events for testing email functionality
 */

const crypto = require('crypto');

// Simulate a payment success webhook event
const mockPaymentSuccessEvent = {
  id: 'evt_test123',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_test123',
      amount: 14900, // $149.00 in cents
      currency: 'usd',
      customer: 'cus_test123',
      metadata: {
        userId: 'test-user-id',
        type: 'membership',
        isNewUser: 'true',
        cart: JSON.stringify([
          {
            tierId: 'meeting-member',
            name: 'Meeting Member',
            price: 149.00
          }
        ]),
        customerInfo: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com'
        }),
        businessInfo: JSON.stringify({
          businessName: 'Test Business'
        }),
        contactInfo: JSON.stringify({
          firstName: 'Test',
          lastName: 'User'
        })
      }
    }
  }
};

// Create a webhook signature
function createWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

async function testWebhookManually() {
  console.log('🧪 Testing webhook manually...\n');

  const payload = JSON.stringify(mockPaymentSuccessEvent);
  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
  const signature = createWebhookSignature(payload, secret);

  try {
    const response = await fetch('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature
      },
      body: payload
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully!');
      console.log('   Response:', result);
    } else {
      console.log('❌ Webhook failed:', result);
    }
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
}

// Run the test
testWebhookManually(); 