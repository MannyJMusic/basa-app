#!/usr/bin/env node

/**
 * Quick Email Test After API Key Fix
 * Run this after updating your Mailgun API key
 */

const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config({ path: '.env.local' });

async function testEmailAfterFix() {
  console.log('🧪 Testing Email After API Key Fix\n');

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;

  console.log('📋 Current Configuration:');
  console.log(`   API Key: ${apiKey ? (apiKey.startsWith('key-') ? '✅ Valid format' : '❌ Wrong format') : '❌ Missing'}`);
  console.log(`   Domain: ${domain || '❌ Missing'}`);
  console.log(`   From Email: ${fromEmail || '❌ Missing'}`);

  if (!apiKey || !apiKey.startsWith('key-')) {
    console.log('\n❌ Please update your MAILGUN_API_KEY with a valid key that starts with "key-"');
    console.log('   Go to: https://app.mailgun.com/settings/api_keys');
    return;
  }

  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });

    // Test domain access
    console.log('\n🔑 Testing API Key...');
    const domainResponse = await mg.domains.get(domain);
    console.log('✅ API Key is valid!');
    console.log(`   Domain: ${domainResponse.domain.name}`);
    console.log(`   State: ${domainResponse.domain.state}`);

    if (domainResponse.domain.state !== 'active') {
      console.log('⚠️  WARNING: Domain is not active. This may cause delivery issues.');
    }

    // Send test email
    console.log('\n📧 Sending test email...');
    const testEmail = 'manny@mannyjmusic.com';
    
    const messageData = {
      from: fromEmail,
      to: testEmail,
      subject: 'BASA Email Test - Fixed API Key',
      html: `
        <h1>🎉 BASA Email System is Working!</h1>
        <p>This email confirms that your Mailgun API key is now working correctly.</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>Domain:</strong> ${domain}</p>
        <p><strong>From:</strong> ${fromEmail}</p>
        <hr>
        <p><small>If you receive this email, your payment confirmation emails should now work!</small></p>
      `
    };

    const response = await mg.messages.create(domain, messageData);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${response.id}`);
    console.log(`   To: ${testEmail}`);
    console.log('\n📬 Check your email inbox (and spam folder) for the test email.');
    console.log('   If you receive it, your payment emails should now work!');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n💡 The API key is still not working. Please:');
      console.log('   1. Go to https://app.mailgun.com/settings/api_keys');
      console.log('   2. Copy the Private API Key (starts with "key-")');
      console.log('   3. Update MAILGUN_API_KEY in your .env.local file');
    } else if (error.message.includes('Domain not found')) {
      console.log('\n💡 Domain issue. Please:');
      console.log('   1. Go to https://app.mailgun.com/domains');
      console.log('   2. Verify your domain is properly configured');
      console.log('   3. Check DNS records are set up correctly');
    }
  }
}

testEmailAfterFix().catch(console.error); 