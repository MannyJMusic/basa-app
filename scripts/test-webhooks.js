#!/usr/bin/env node

/**
 * Comprehensive Webhook Testing Script
 * Consolidates all webhook testing functionality including Stripe, email, and manual testing
 */

const { exec } = require('child_process');
const readline = require('readline');
const fetch = require('node-fetch');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}[${new Date().toISOString()}]${colors.reset} ${message}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Stripe webhook events
const stripeWebhookEvents = [
  { name: 'Payment Success', command: 'payment_intent.succeeded' },
  { name: 'Payment Failed', command: 'payment_intent.payment_failed' },
  { name: 'Subscription Created', command: 'customer.subscription.created' },
  { name: 'Subscription Updated', command: 'customer.subscription.updated' },
  { name: 'Subscription Deleted', command: 'customer.subscription.deleted' },
  { name: 'Invoice Payment Success', command: 'invoice.payment_succeeded' },
  { name: 'Invoice Payment Failed', command: 'invoice.payment_failed' },
  { name: 'Customer Created', command: 'customer.created' },
  { name: 'Customer Updated', command: 'customer.updated' },
  { name: 'Customer Deleted', command: 'customer.deleted' }
];

// Test webhook email system
async function testWebhookEmail() {
  info('Testing webhook email system...');
  
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

  try {
    const response = await fetch('http://localhost:3000/api/dev/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      success('Webhook email test successful!');
      info(`Payment Intent ID: ${result.paymentIntentId}`);
      info(`Message: ${result.message}`);
    } else {
      error('Webhook email test failed!');
      error(`Error: ${result.error}`);
      error(`Details: ${result.details}`);
    }
  } catch (err) {
    error(`Webhook email test failed: ${err.message}`);
  }
}

// Test manual webhook (simulates Stripe webhook)
async function testManualWebhook() {
  info('Testing manual webhook simulation...');
  
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

  // Create webhook signature
  function createWebhookSignature(payload, secret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');
    
    return `t=${timestamp},v1=${signature}`;
  }

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
      success('Manual webhook processed successfully!');
      info(`Response: ${JSON.stringify(result, null, 2)}`);
    } else {
      error(`Manual webhook failed: ${JSON.stringify(result, null, 2)}`);
    }
  } catch (err) {
    error(`Manual webhook test failed: ${err.message}`);
  }
}

// Trigger Stripe webhook using CLI
function triggerStripeWebhook(eventCommand) {
  info(`Triggering Stripe webhook: ${eventCommand}`);
  
  return new Promise((resolve, reject) => {
    exec(`stripe trigger ${eventCommand}`, (error, stdout, stderr) => {
      if (error) {
        error(`Error triggering webhook: ${error.message}`);
        warning('Make sure Stripe CLI is installed and running');
        reject(error);
        return;
      }
      
      if (stderr) {
        warning(`Warning: ${stderr}`);
      }
      
      success('Stripe webhook triggered successfully!');
      info('Event details:');
      console.log(stdout);
      resolve(stdout);
    });
  });
}

// Show menu for Stripe webhook testing
function showStripeMenu() {
  console.log('\n🔔 Stripe Webhook Testing\n');
  console.log('Available webhook events:');
  
  stripeWebhookEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.name}`);
  });
  
  console.log('0. Back to main menu');
}

// Handle Stripe webhook selection
async function handleStripeWebhook() {
  return new Promise((resolve) => {
    showStripeMenu();
    
    rl.question('\nSelect an event to trigger (0-10): ', async (answer) => {
      const choice = parseInt(answer);
      
      if (choice === 0) {
        resolve();
        return;
      }
      
      if (choice >= 1 && choice <= stripeWebhookEvents.length) {
        const selectedEvent = stripeWebhookEvents[choice - 1];
        try {
          await triggerStripeWebhook(selectedEvent.command);
        } catch (err) {
          error('Failed to trigger webhook');
        }
        
        // Ask if user wants to trigger another event
        setTimeout(() => {
          rl.question('\nPress Enter to continue or type "exit" to quit: ', (input) => {
            if (input.toLowerCase() === 'exit') {
              resolve('exit');
            } else {
              resolve();
            }
          });
        }, 2000);
      } else {
        error('Invalid choice. Please select a number between 0 and 10.');
        setTimeout(() => resolve(), 1000);
      }
    });
  });
}

// Main menu
function showMainMenu() {
  console.log('\n🔔 BASA Webhook Testing Tool\n');
  console.log('Available tests:');
  console.log('1. Test Webhook Email System');
  console.log('2. Test Manual Webhook (Stripe simulation)');
  console.log('3. Test Stripe Webhooks (requires Stripe CLI)');
  console.log('4. Run All Tests');
  console.log('0. Exit');
  console.log('\nMake sure your Next.js server is running!');
}

// Main execution
async function main() {
  // Check if Stripe CLI is available
  exec('stripe --version', (error) => {
    if (error) {
      warning('Stripe CLI not found - Stripe webhook testing will be limited');
      warning('Install: https://stripe.com/docs/stripe-cli');
    } else {
      success('Stripe CLI found!');
    }
  });

  while (true) {
    showMainMenu();
    
    const choice = await new Promise((resolve) => {
      rl.question('\nSelect an option (0-4): ', (answer) => {
        resolve(parseInt(answer));
      });
    });

    switch (choice) {
      case 0:
        console.log('👋 Goodbye!');
        rl.close();
        return;
      
      case 1:
        await testWebhookEmail();
        break;
      
      case 2:
        await testManualWebhook();
        break;
      
      case 3:
        const result = await handleStripeWebhook();
        if (result === 'exit') {
          console.log('👋 Goodbye!');
          rl.close();
          return;
        }
        break;
      
      case 4:
        info('Running all webhook tests...');
        await testWebhookEmail();
        await testManualWebhook();
        if (!error) {
          await triggerStripeWebhook('payment_intent.succeeded');
        }
        success('All webhook tests completed!');
        break;
      
      default:
        error('Invalid choice. Please select a number between 0 and 4.');
        break;
    }

    // Wait before showing menu again
    await new Promise((resolve) => {
      rl.question('\nPress Enter to continue...', resolve);
    });
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
BASA Webhook Testing Tool

This tool consolidates all webhook testing functionality:
- Webhook email system testing
- Manual webhook simulation (Stripe-like)
- Stripe webhook testing (requires Stripe CLI)

Prerequisites:
1. Next.js server running on localhost:3000
2. Stripe CLI installed (for Stripe webhook testing)
3. Environment variables configured

Usage:
  node scripts/test-webhooks.js

For Stripe CLI setup:
1. Install: https://stripe.com/docs/stripe-cli
2. Login: stripe login
3. Forward webhooks: stripe listen --forward-to localhost:3000/api/webhooks/stripe
`);
  process.exit(0);
}

// Start the application
main().catch(console.error); 