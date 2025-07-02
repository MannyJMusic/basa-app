#!/usr/bin/env node

/**
 * Comprehensive Email Delivery Debugging Script
 * This script helps identify why emails aren't being delivered
 */

const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config({ path: '.env.local' });

async function debugEmailDelivery() {
  console.log('🔍 BASA Email Delivery Debugging\n');

  // 1. Check Environment Variables
  console.log('1️⃣ Checking Environment Variables:');
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;
  
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Domain: ${domain || '❌ Missing'}`);
  console.log(`   From Email: ${fromEmail || '❌ Missing'}`);
  
  if (!apiKey || !domain) {
    console.log('\n❌ Missing required configuration!');
    return;
  }

  // 2. Test Mailgun API Connection
  console.log('\n2️⃣ Testing Mailgun API Connection:');
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
    console.log(`   Web Scheme: ${domainResponse.domain.web_scheme}`);
    console.log(`   Sending Scheme: ${domainResponse.domain.sending_scheme}`);
    
    if (domainResponse.domain.state !== 'active') {
      console.log('⚠️  WARNING: Domain is not active!');
      console.log('   This could be why emails aren\'t being delivered.');
    }

  } catch (error) {
    console.log('❌ Mailgun API test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Unauthorized')) {
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
    return;
  }

  // 3. Check Domain DNS Records
  console.log('\n3️⃣ Checking Domain DNS Records:');
  console.log('   Please verify these DNS records are set up for your domain:');
  console.log(`   Domain: ${domain}`);
  console.log('   Required records:');
  console.log('   - MX record pointing to mxa.mailgun.org');
  console.log('   - TXT record for SPF: v=spf1 include:mailgun.org ~all');
  console.log('   - CNAME record for email: mxa.mailgun.org');
  
  // 4. Test Email Sending with Detailed Logging
  console.log('\n4️⃣ Testing Email Sending:');
  const testEmail = 'manny@mannyjmusic.com';
  
  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });

    const messageData = {
      from: fromEmail,
      to: testEmail,
      subject: 'BASA Email System Test - ' + new Date().toISOString(),
      html: `
        <h1>BASA Email System Test</h1>
        <p>This is a test email from the BASA email system.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>Domain: ${domain}</p>
        <p>From: ${fromEmail}</p>
        <hr>
        <p><small>If you receive this email, the email system is working correctly.</small></p>
      `,
      'h:X-Mailgun-Variables': JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        domain: domain
      })
    };

    console.log('   Sending test email...');
    const response = await mg.messages.create(domain, messageData);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${response.id}`);
    console.log(`   To: ${testEmail}`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   Domain: ${domain}`);
    
    // 5. Check Email Events (if available)
    console.log('\n5️⃣ Checking Email Events:');
    try {
      const events = await mg.events.get(domain, {
        limit: 5,
        event: 'delivered'
      });
      
      if (events.items && events.items.length > 0) {
        console.log('✅ Recent delivered emails found:');
        events.items.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.recipient} - ${event.timestamp}`);
        });
      } else {
        console.log('⚠️  No recent delivered emails found');
        console.log('   This might indicate delivery issues');
      }
    } catch (eventsError) {
      console.log('⚠️  Could not fetch email events:', eventsError.message);
    }

  } catch (error) {
    console.log('❌ Email sending failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Domain not found')) {
      console.log('\n💡 Solution:');
      console.log('   1. Verify your domain is properly configured in Mailgun');
      console.log('   2. Check that DNS records are set up correctly');
      console.log('   3. Wait for DNS propagation (can take up to 24 hours)');
    } else if (error.message.includes('Invalid recipient')) {
      console.log('\n💡 Solution:');
      console.log('   1. Check that the recipient email address is valid');
      console.log('   2. Try with a different email address');
    }
  }

  // 6. Recommendations
  console.log('\n6️⃣ Recommendations:');
  console.log('   If emails are being sent but not received:');
  console.log('   1. Check your spam/junk folder');
  console.log('   2. Check your email provider\'s filtering settings');
  console.log('   3. Try adding noreply@member.businessassociationsa.com to your contacts');
  console.log('   4. Check if your email provider blocks emails from new domains');
  console.log('   5. Verify the domain reputation on https://mxtoolbox.com/');
  
  console.log('\n   For domain configuration:');
  console.log('   1. Go to https://app.mailgun.com/domains');
  console.log('   2. Click on your domain');
  console.log('   3. Follow the DNS setup instructions');
  console.log('   4. Wait for DNS propagation');
  
  console.log('\n   For testing:');
  console.log('   1. Try sending to a Gmail address (Gmail is more permissive)');
  console.log('   2. Check Mailgun logs at https://app.mailgun.com/logs');
  console.log('   3. Use Mailgun\'s test mode for initial setup');
}

// Run the debug script
debugEmailDelivery().catch(console.error); 