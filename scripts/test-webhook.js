#!/usr/bin/env node

/**
 * Test webhook endpoint
 * Usage: node scripts/test-webhook.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

async function testWebhook() {
  console.log('🧪 Testing Stripe Webhook...');
  console.log('🔧 Environment:', process.env.NODE_ENV);
  console.log('🌐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('🔑 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set');
  console.log('🔑 STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set');
  console.log('');

  // First, check if the server is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health');
    if (!healthCheck.ok) {
      console.log('❌ Server is not running. Please start the development server first:');
      console.log('   npm run dev');
      return;
    }
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Cannot connect to server. Please start the development server first:');
    console.log('   npm run dev');
    return;
  }

  // Test webhook endpoint directly
  try {
    console.log('📤 Testing webhook endpoint...');
    
    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'payment_intent.succeeded',
        id: 'evt_test_' + Date.now(),
        data: {
          object: {
            id: 'pi_test_' + Date.now(),
            amount: 9999, // $99.99
            currency: 'usd',
            customer: 'cus_test_' + Date.now(),
            metadata: {
              userId: 'test-user-id',
              type: 'membership',
              cart: JSON.stringify([
                {
                  tierId: 'premium-member',
                  quantity: 1,
                  price: 99.99,
                  name: 'Premium Membership'
                }
              ]),
              customerInfo: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com'
              }),
              businessInfo: JSON.stringify({
                businessName: 'Test Company'
              }),
              isNewUser: 'false'
            }
          }
        }
      })
    });

    const result = await response.text();
    console.log('📥 Webhook response status:', response.status);
    console.log('📥 Webhook response:', result);
    
    if (response.ok) {
      console.log('✅ Webhook endpoint is accessible');
    } else {
      console.log('❌ Webhook endpoint returned error');
    }
  } catch (error) {
    console.log('💥 Webhook test failed with exception:');
    console.error(error);
  }
}

testWebhook().catch(console.error); 