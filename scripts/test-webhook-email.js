#!/usr/bin/env node

/**
 * Test webhook email system
 * This script tests the webhook email functionality directly
 */

const fetch = require('node-fetch');

async function testWebhookEmail() {
  const testData = {
    userId: 'test-user-' + Date.now(),
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'CEO',
    company: 'Test Business Inc',
    businessName: 'Test Business Inc',
    phone: '(210) 555-0123',
    isNewUser: true
  };

  console.log('🧪 Testing webhook email system...');
  console.log('Test data:', testData);

  try {
    const response = await fetch('http://localhost:3000/api/dev/test-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Webhook test successful!');
      console.log('Payment Intent ID:', result.paymentIntentId);
      console.log('Message:', result.message);
    } else {
      console.log('❌ Webhook test failed!');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('Make sure the development server is running on http://localhost:3000');
  }
}

// Run the test
testWebhookEmail(); 