import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendPasswordResetEmail, sendEventInvitationEmail } from '@/lib/basa-emails'

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
        const activationUrl = body.activationUrl || 'https://dev.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com'
        result = await sendWelcomeEmail(email, firstName, activationUrl, { fromName })
        break
      case 'password-reset':
        const resetUrl = body.resetUrl || 'https://dev.businessassociationsa.com/auth/reset-password?token=reset123&email=test@example.com'
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
          rsvpUrl: 'https://dev.businessassociationsa.com/events/mixer/rsvp',
          calendarUrl: 'https://dev.businessassociationsa.com/events/mixer/calendar',
          shareUrl: 'https://dev.businessassociationsa.com/events/mixer'
        }
        result = await sendEventInvitationEmail(email, firstName, event, { fromName })
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