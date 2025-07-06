import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendPasswordResetEmail, sendEventInvitationEmail, sendPaymentReceiptEmail, sendContactFormEmail } from '@/lib/basa-emails'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { template, email, firstName, fromName } = body

    if (!email || !firstName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and firstName are required' 
      }, { status: 400 })
    }

    let result

    switch (template) {
      case 'welcome':
        const activationUrl = body.activationUrl || 'https://app.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com'
        result = await sendWelcomeEmail(email, firstName, activationUrl, { fromName })
        break
      case 'password-reset':
        const resetUrl = body.resetUrl || 'https://app.businessassociationsa.com/auth/reset-password?token=reset123&email=test@example.com'
        result = await sendPasswordResetEmail(email, firstName, resetUrl, { fromName })
        break
      case 'event-invitation':
        const event = body.event || {
          title: 'BASA Networking Mixer',
          date: new Date('2024-01-15'),
          time: '6:00 PM',
          location: 'San Antonio Business Hub',
          address: '123 Business St, San Antonio, TX',
          capacity: 100,
          price: 25,
          description: 'Join us for an evening of networking and professional development with fellow BASA members.',
          speakers: [
            { name: 'John Smith', title: 'CEO, Tech Solutions Inc.' },
            { name: 'Sarah Johnson', title: 'Director of Business Development' }
          ],
                  rsvpUrl: 'https://app.businessassociationsa.com/events/mixer/rsvp',
        calendarUrl: 'https://app.businessassociationsa.com/events/mixer/calendar',
        shareUrl: 'https://app.businessassociationsa.com/events/mixer'
        }
        result = await sendEventInvitationEmail(email, firstName, event, { fromName })
        break
      case 'payment-receipt':
        const paymentData = {
          paymentId: body.paymentId || 'pi_test_123',
          amount: parseFloat(body.amount || '99.99'),
          currency: body.currency || 'usd',
          cart: [
            {
              tierId: body.tierId || 'premium-member',
              quantity: parseInt(body.quantity || '1'),
              price: parseFloat(body.price || '99.99'),
              name: body.tierName || 'Premium Membership'
            }
          ],
          customerInfo: {
            name: body.firstName || 'Test User',
            email: body.email || 'test@example.com'
          },
          businessInfo: {
            businessName: body.businessName || 'Test Company'
          },
          paymentDate: body.paymentDate || new Date().toISOString()
        }
        result = await sendPaymentReceiptEmail(body.email, body.firstName, paymentData, { fromName })
        break
      case 'contact-form':
        const contact = body.contact || {
          firstName,
          lastName: 'Doe',
          email,
          phone: '(210) 555-0123',
          company: 'Acme Corporation',
          subject: 'General Inquiry',
          message: 'Hello, I would like to learn more about BASA membership opportunities and upcoming events.',
          preferredContact: 'email',
          membershipInterest: true
        }
        result = await sendContactFormEmail('info@businessassociationsa.com', contact, { fromName })
        break
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Template not supported' 
        }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Test ${template} email sent to ${email}`,
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test email' 
    }, { status: 500 })
  }
} 