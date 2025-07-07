#!/usr/bin/env node

/**
 * Simple email testing script
 * Usage: node scripts/test-email.js [email]
 * 
 * This script tests the email system using the development API
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

async function testEmail() {
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('🧪 Testing BASA Email System...');
  console.log('📧 Test email:', testEmail);
  console.log('🔧 Environment:', process.env.NODE_ENV);
  console.log('📮 Mailgun Domain:', process.env.MAILGUN_DOMAIN);
  console.log('🔑 Mailgun API Key:', process.env.MAILGUN_API_KEY ? 'Set' : 'Not set');
  console.log('🌐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
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

  // Test email sending via the development API
  try {
    console.log('📤 Sending test email...');
    
    const response = await fetch('http://localhost:3000/api/dev/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: 'receipt',
        email: testEmail,
        firstName: 'Test User',
        fromName: 'BASA Test'
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📨 Message ID:', result.messageId);
      console.log('📧 Check your inbox:', testEmail);
      console.log('');
      console.log('💡 If you don\'t see the email:');
      console.log('   1. Check your spam folder');
      console.log('   2. Verify your Mailgun domain is active');
      console.log('   3. Check Mailgun logs for delivery status');
    } else {
      console.log('❌ Email failed to send');
      console.log('🚨 Error:', result.error);
    }
  } catch (error) {
    console.log('💥 Email test failed with exception:');
    console.error(error);
  }
}

testEmail().catch(console.error); 