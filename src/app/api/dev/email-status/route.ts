import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin, isResponse } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const guard = await requireDevAdmin()
  if (isResponse(guard)) return guard
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const email = searchParams.get('email')
    
    if (!paymentId || !email) {
      return NextResponse.json({ 
        error: 'Payment ID and email are required' 
      }, { status: 400 })
    }

    // In a real implementation, you would check your email service logs
    // For now, we'll simulate checking email status
    const emailStatus = {
      paymentId,
      email,
      timestamp: new Date().toISOString(),
      emails: [
        {
          type: 'welcome',
          status: 'sent',
          sentAt: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
          messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
          template: 'welcome'
        },
        {
          type: 'receipt',
          status: 'sent',
          sentAt: new Date(Date.now() - 3000).toISOString(), // 3 seconds ago
          messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
          template: 'payment-receipt'
        }
      ],
      environment: process.env.NODE_ENV,
      mailgunDomain: process.env.MAILGUN_DOMAIN,
      mailgunApiKey: process.env.MAILGUN_API_KEY ? 'Configured' : 'Not configured'
    }

    return NextResponse.json({
      success: true,
      data: emailStatus
    })
  } catch (error) {
    console.error('Error checking email status:', error)
    return NextResponse.json({ 
      error: 'Failed to check email status' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireDevAdmin()
  if (isResponse(guard)) return guard

  try {
    const body = await request.json()
    const { paymentId, email, emailType } = body
    
    if (!paymentId || !email || !emailType) {
      return NextResponse.json({ 
        error: 'Payment ID, email, and email type are required' 
      }, { status: 400 })
    }

    // Simulate email sending for development
    const emailResult = {
      paymentId,
      email,
      emailType,
      status: 'sent',
      sentAt: new Date().toISOString(),
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
      template: emailType,
      environment: process.env.NODE_ENV
    }

    // Log the email sending for development

    return NextResponse.json({
      success: true,
      data: emailResult
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email' 
    }, { status: 500 })
  }
} 