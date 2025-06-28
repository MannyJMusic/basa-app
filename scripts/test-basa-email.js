const axios = require('axios')

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'

// Test data
const testData = {
  welcome: {
    email: TEST_EMAIL,
    firstName: 'John',
    activationUrl: 'https://dev.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com'
  },
  passwordReset: {
    email: TEST_EMAIL,
    firstName: 'Jane',
    resetUrl: 'https://dev.businessassociationsa.com/auth/reset-password?token=reset123&email=test@example.com'
  },
  eventInvitation: {
    email: TEST_EMAIL,
    firstName: 'Mike',
    eventName: 'BASA Networking Mixer',
    eventDate: '2024-01-15',
    eventTime: '6:00 PM',
    eventLocation: 'San Antonio Business Hub',
    rsvpUrl: 'https://dev.businessassociationsa.com/events/networking-mixer/rsvp'
  }
}

async function testEmailPreview(template, data) {
  console.log(`\n📧 Testing ${template} email preview...`)
  
  try {
    const params = new URLSearchParams({
      template,
      ...data
    })
    
    const response = await axios.get(`${BASE_URL}/api/dev/email-preview?${params}`)
    
    if (response.status === 200) {
      console.log('✅ Email preview generated successfully')
      console.log(`📄 Preview URL: ${BASE_URL}/api/dev/email-preview?${params}`)
      return true
    }
  } catch (error) {
    console.error('❌ Email preview failed:', error.response?.data || error.message)
    return false
  }
}

async function testEmailSending(template, data) {
  console.log(`\n📤 Testing ${template} email sending...`)
  
  try {
    const response = await axios.post(`${BASE_URL}/api/dev/test-email`, {
      template,
      ...data
    })
    
    if (response.data.success) {
      console.log('✅ Test email sent successfully')
      console.log(`📧 Sent to: ${data.email}`)
      console.log(`🆔 Message ID: ${response.data.messageId}`)
      return true
    } else {
      console.error('❌ Email sending failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error.response?.data || error.message)
    return false
  }
}

async function testActivationFlow() {
  console.log('\n🔗 Testing activation flow...')
  
  try {
    // Test activation endpoint
    const activationResponse = await axios.get(`${BASE_URL}/api/auth/activate?token=test123&email=test@example.com`)
    
    if (activationResponse.status === 200) {
      console.log('✅ Activation endpoint accessible')
    } else {
      console.log('⚠️  Activation endpoint returned:', activationResponse.status)
    }
  } catch (error) {
    console.log('⚠️  Activation endpoint test:', error.response?.status || 'Connection failed')
  }
}

async function testMailgunConfiguration() {
  console.log('\n⚙️  Testing Mailgun configuration...')
  
  const requiredEnvVars = [
    'MAILGUN_API_KEY',
    'MAILGUN_DOMAIN',
    'MAILGUN_FROM_EMAIL'
  ]
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    return false
  }
  
  console.log('✅ All required environment variables are set')
  console.log(`📧 From email: ${process.env.MAILGUN_FROM_EMAIL}`)
  console.log(`🌐 Domain: ${process.env.MAILGUN_DOMAIN}`)
  
  return true
}

async function runAllTests() {
  console.log('🚀 Starting BASA Email System Tests...')
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log(`📧 Test Email: ${TEST_EMAIL}`)
  
  // Test configuration
  const configOk = await testMailgunConfiguration()
  if (!configOk) {
    console.log('\n❌ Configuration test failed. Please check your environment variables.')
    return
  }
  
  // Test activation flow
  await testActivationFlow()
  
  // Test each email template
  for (const [template, data] of Object.entries(testData)) {
    await testEmailPreview(template, data)
    await testEmailSending(template, data)
  }
  
  console.log('\n🎉 All tests completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Check your email inbox for test emails')
  console.log('2. Visit the preview page: http://localhost:3000/dev/email-preview')
  console.log('3. Test activation links manually')
  console.log('4. Verify email rendering in different email clients')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testEmailPreview,
  testEmailSending,
  testActivationFlow,
  testMailgunConfiguration,
  runAllTests
} 