import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentIntentSucceeded } from '../../webhooks/stripe/route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Import prisma for user creation
    const { prisma } = await import('@/lib/db')
    
    // Create or get a test user
    let userId = body.userId
    if (!userId) {
      const testEmail = body.customerEmail || 'test@example.com'
      
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: testEmail }
      })
      
      if (!user) {
        // Create test user
        user = await prisma.user.create({
          data: {
            email: testEmail,
            firstName: body.firstName || 'Test',
            lastName: body.lastName || 'User',
            role: 'GUEST',
            emailVerified: null,
            verificationToken: null,
            resetToken: null,
            resetTokenExpiry: null,
                         member: {
               create: {
                 businessName: body.businessName || 'Test Business',
                 membershipTier: 'BASIC',
                 membershipStatus: 'INACTIVE',
                 joinedAt: new Date()
               }
             }
          }
        })
        console.log('Created test user:', user.id)
      }
      
      userId = user.id
    }
    
    // Create a mock payment intent object for testing
    const mockPaymentIntent = {
      id: 'pi_test_' + Date.now(),
      amount: 24500, // $245.00 in cents
      currency: 'usd',
      customer: 'cus_test_customer',
      metadata: {
        userId: userId,
        type: 'membership',
        isNewUser: body.isNewUser || 'true',
        cart: JSON.stringify([
          {
            tierId: 'associate-member',
            name: 'Associate Member',
            price: 245.00,
            quantity: 1
          }
        ]),
        customerInfo: JSON.stringify({
          name: body.customerName || 'Test User',
          email: body.customerEmail || 'test@example.com',
          company: body.company || 'Test Business',
          phone: body.phone || '(210) 555-0123'
        }),
        businessInfo: JSON.stringify({
          businessName: body.businessName || 'Test Business',
          industry: 'technology',
          businessAddress: '123 Test St',
          city: 'San Antonio',
          state: 'TX',
          zipCode: '78205',
          businessPhone: '(210) 555-0123',
          website: 'https://testbusiness.com',
          businessDescription: 'A test business for webhook testing'
        }),
        contactInfo: JSON.stringify({
          firstName: body.firstName || 'Test',
          lastName: body.lastName || 'User',
          jobTitle: body.jobTitle || 'CEO',
          email: body.customerEmail || 'test@example.com',
          phone: body.phone || '(210) 555-0123',
          linkedin: 'https://linkedin.com/in/testuser'
        }),
        additionalMembers: JSON.stringify([])
      }
    }

    console.log('Testing webhook with payment intent:', mockPaymentIntent.id)
    console.log('Using user ID:', userId)
    
    // Call the webhook handler directly
    await handlePaymentIntentSucceeded(mockPaymentIntent)
    
    return NextResponse.json({
      success: true,
      message: 'Webhook test completed',
      paymentIntentId: mockPaymentIntent.id
    })
    
  } catch (error) {
    console.error('Webhook test failed:', error)
    return NextResponse.json(
      { error: 'Webhook test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 