#!/usr/bin/env node

/**
 * Test script to verify email system functionality
 * Run with: node scripts/test-email-system.js
 */

const { sendWelcomeEmail, sendPaymentReceiptEmail } = require('../src/lib/basa-emails');

async function testEmailSystem() {
  console.log('🧪 Testing BASA Email System...\n');

  try {
    // Test welcome email
    console.log('📧 Testing welcome email...');
    const welcomeResult = await sendWelcomeEmail(
      'test@example.com',
      'Test User',
      'https://dev.businessassociationsa.com/auth/verify-email?token=test123&email=test@example.com',
      {
        siteUrl: 'https://dev.businessassociationsa.com',
        logoUrl: 'https://dev.businessassociationsa.com/images/BASA-LOGO.png'
      }
    );
    
    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log(`   Message ID: ${welcomeResult.messageId}`);
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }

    console.log('\n📧 Testing payment receipt email...');
    const receiptResult = await sendPaymentReceiptEmail(
      'test@example.com',
      'Test User',
      {
        paymentId: 'pi_test123',
        amount: 149.00,
        currency: 'usd',
        cart: [
          {
            tierId: 'meeting-member',
            name: 'Meeting Member',
            price: 149.00
          }
        ],
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com'
        },
        businessInfo: {
          businessName: 'Test Business'
        },
        paymentDate: new Date().toISOString()
      },
      {
        siteUrl: 'https://dev.businessassociationsa.com',
        logoUrl: 'https://dev.businessassociationsa.com/images/BASA-LOGO.png'
      }
    );

    if (receiptResult.success) {
      console.log('✅ Payment receipt email sent successfully!');
      console.log(`   Message ID: ${receiptResult.messageId}`);
    } else {
      console.log('❌ Payment receipt email failed:', receiptResult.error);
    }

  } catch (error) {
    console.error('❌ Email system test failed:', error);
  }
}

// Run the test
testEmailSystem(); 