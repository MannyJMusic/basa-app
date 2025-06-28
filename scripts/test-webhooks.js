#!/usr/bin/env node

/**
 * Test Stripe Webhooks Locally
 * 
 * This script helps test webhook events during development.
 * Make sure you have the Stripe CLI installed and running:
 * stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const webhookEvents = [
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

function showMenu() {
  console.log('\n🔔 Stripe Webhook Testing Tool\n');
  console.log('Available webhook events:');
  
  webhookEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.name}`);
  });
  
  console.log('0. Exit');
  console.log('\nMake sure your Next.js server is running and Stripe CLI is forwarding webhooks!');
}

function triggerWebhook(eventCommand) {
  console.log(`\n🚀 Triggering: ${eventCommand}`);
  
  exec(`stripe trigger ${eventCommand}`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error triggering webhook:', error.message);
      console.log('\n💡 Make sure:');
      console.log('1. Stripe CLI is installed: https://stripe.com/docs/stripe-cli');
      console.log('2. You are logged in: stripe login');
      console.log('3. Webhook forwarding is running: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
      return;
    }
    
    if (stderr) {
      console.error('⚠️  Warning:', stderr);
    }
    
    console.log('✅ Webhook triggered successfully!');
    console.log('\n📋 Event details:');
    console.log(stdout);
    
    console.log('\n🔍 Check your server logs for webhook processing...');
  });
}

function main() {
  showMenu();
  
  rl.question('\nSelect an event to trigger (0-10): ', (answer) => {
    const choice = parseInt(answer);
    
    if (choice === 0) {
      console.log('👋 Goodbye!');
      rl.close();
      return;
    }
    
    if (choice >= 1 && choice <= webhookEvents.length) {
      const selectedEvent = webhookEvents[choice - 1];
      triggerWebhook(selectedEvent.command);
      
      // Ask if user wants to trigger another event
      setTimeout(() => {
        rl.question('\nPress Enter to continue or type "exit" to quit: ', (input) => {
          if (input.toLowerCase() === 'exit') {
            console.log('👋 Goodbye!');
            rl.close();
          } else {
            main();
          }
        });
      }, 2000);
    } else {
      console.log('❌ Invalid choice. Please select a number between 0 and 10.');
      setTimeout(main, 1000);
    }
  });
}

// Check if Stripe CLI is available
exec('stripe --version', (error) => {
  if (error) {
    console.error('❌ Stripe CLI not found!');
    console.log('\n📦 Please install Stripe CLI first:');
    console.log('Windows: choco install stripe-cli');
    console.log('macOS: brew install stripe/stripe-cli/stripe');
    console.log('Linux: See https://stripe.com/docs/stripe-cli#install');
    process.exit(1);
  }
  
  console.log('✅ Stripe CLI found!');
  main();
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
}); 