#!/usr/bin/env node

/**
 * Test Mailgun configuration
 * Run with: node scripts/test-mailgun-config.js
 */

const formData = require('form-data');
const Mailgun = require('mailgun.js');

async function testMailgunConfig() {
  console.log('🧪 Testing Mailgun Configuration...\n');

  // Check environment variables
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;

  console.log('📋 Configuration Check:');
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Domain: ${domain || '❌ Missing'}`);
  console.log(`   From Email: ${fromEmail || '❌ Missing'}`);

  if (!apiKey || !domain) {
    console.log('\n❌ Missing required configuration!');
    console.log('   Please set MAILGUN_API_KEY and MAILGUN_DOMAIN in your .env.local file');
    return;
  }

  // Test API key validity
  console.log('\n🔑 Testing API Key...');
  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });

    // Test domain access
    const domainResponse = await mg.domains.get(domain);
    console.log('✅ Domain access successful!');
    console.log(`   Domain: ${domainResponse.domain.name}`);
    console.log(`   State: ${domainResponse.domain.state}`);

    // Test sending a simple email
    console.log('\n📧 Testing email sending...');
    const testEmail = {
      from: fromEmail,
      to: 'test@example.com',
      subject: 'BASA Email System Test',
      html: '<h1>Test Email</h1><p>This is a test email from the BASA email system.</p>'
    };

    const response = await mg.messages.create(domain, testEmail);
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${response.id}`);

  } catch (error) {
    console.log('❌ Mailgun test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid private key')) {
      console.log('\n💡 Solution:');
      console.log('   1. Go to https://app.mailgun.com/settings/api_keys');
      console.log('   2. Copy your Private API Key (starts with "key-")');
      console.log('   3. Update MAILGUN_API_KEY in your .env.local file');
    } else if (error.message.includes('Domain not found')) {
      console.log('\n💡 Solution:');
      console.log('   1. Go to https://app.mailgun.com/domains');
      console.log('   2. Verify your domain is properly configured');
      console.log('   3. Update MAILGUN_DOMAIN in your .env.local file');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testMailgunConfig(); 