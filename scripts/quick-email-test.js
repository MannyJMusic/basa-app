#!/usr/bin/env node

const axios = require('axios')

// Quick test configuration
const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = process.argv[2] || 'test@example.com'

async function quickTest() {
  console.log(`🚀 Quick BASA Email Test`)
  console.log(`📧 Test Email: ${TEST_EMAIL}`)
  console.log(`📍 Base URL: ${BASE_URL}`)
  
  try {
    // Test 1: Preview generation
    console.log('\n1️⃣ Testing email preview...')
    const previewResponse = await axios.get(`${BASE_URL}/api/dev/email-preview?template=welcome&firstName=Test&email=${TEST_EMAIL}`)
    console.log('✅ Preview generated successfully')
    
    // Test 2: Send test email
    console.log('\n2️⃣ Sending test email...')
    const emailResponse = await axios.post(`${BASE_URL}/api/dev/test-email`, {
      template: 'welcome',
      email: TEST_EMAIL,
      firstName: 'Test User',
      activationUrl: 'https://dev.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com'
    })
    
    if (emailResponse.data.success) {
      console.log('✅ Test email sent successfully!')
      console.log(`📧 Check your inbox: ${TEST_EMAIL}`)
    } else {
      console.log('❌ Email sending failed:', emailResponse.data.error)
    }
    
    // Test 3: Preview page
    console.log('\n3️⃣ Preview page available at:')
    console.log(`${BASE_URL}/dev/email-preview`)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure:')
    console.log('1. Your development server is running (npm run dev)')
    console.log('2. Mailgun environment variables are set')
    console.log('3. You\'re using a valid email address')
  }
}

quickTest() 