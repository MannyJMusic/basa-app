import { NextRequest, NextResponse } from 'next/server'
import { generateWelcomeEmailHtml, generatePasswordResetEmailHtml, generateEventInvitationEmailHtml, generateContactFormEmailHtml } from '@/lib/basa-emails'

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const template = searchParams.get('template') || 'welcome'
  const email = searchParams.get('email') || 'test@example.com'
  const firstName = searchParams.get('firstName') || 'John'
  const activationUrl = searchParams.get('activationUrl') || 'https://dev.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com'
  const resetUrl = searchParams.get('resetUrl') || 'https://dev.businessassociationsa.com/auth/reset-password?token=reset123&email=test@example.com'

  let html = ''

  switch (template) {
    case 'welcome':
      html = generateWelcomeEmailHtml(firstName, activationUrl, {
        siteUrl: process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com',
        logoUrl: `${process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com'}/images/BASA-LOGO.png`
      })
      break
    case 'password-reset':
      html = generatePasswordResetEmailHtml(firstName, resetUrl, {
        siteUrl: process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com',
        logoUrl: `${process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com'}/images/BASA-LOGO.png`
      })
      break
    case 'event-invitation':
      const eventData = {
        title: searchParams.get('eventName') || 'BASA Networking Mixer',
        date: new Date(searchParams.get('eventDate') || '2024-01-15'),
        time: searchParams.get('eventTime') || '6:00 PM',
        location: searchParams.get('eventLocation') || 'San Antonio Business Hub',
        address: searchParams.get('eventAddress') || '123 Business St, San Antonio, TX',
        capacity: parseInt(searchParams.get('eventCapacity') || '100'),
        price: parseInt(searchParams.get('eventPrice') || '25'),
        description: searchParams.get('eventDescription') || 'Join us for an evening of networking and professional development with fellow BASA members.',
        speakers: searchParams.get('eventSpeakers') ? JSON.parse(searchParams.get('eventSpeakers')!) : [
          { name: 'John Smith', title: 'CEO, Tech Solutions Inc.' },
          { name: 'Sarah Johnson', title: 'Director of Business Development' }
        ],
        rsvpUrl: searchParams.get('rsvpUrl') || 'https://dev.businessassociationsa.com/events/mixer/rsvp',
        calendarUrl: searchParams.get('calendarUrl') || 'https://dev.businessassociationsa.com/events/mixer/calendar',
        shareUrl: searchParams.get('shareUrl') || 'https://dev.businessassociationsa.com/events/mixer'
      }
      html = generateEventInvitationEmailHtml(firstName, eventData, {
        siteUrl: process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com',
        logoUrl: `${process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com'}/images/BASA-LOGO.png`
      })
      break
    case 'contact-form':
      const contactData = {
        firstName,
        lastName: searchParams.get('lastName') || 'Doe',
        email,
        phone: searchParams.get('phone') || '(210) 555-0123',
        company: searchParams.get('company') || 'Acme Corporation',
        subject: searchParams.get('subject') || 'General Inquiry',
        message: searchParams.get('message') || 'Hello, I would like to learn more about BASA membership opportunities and upcoming events.',
        preferredContact: searchParams.get('preferredContact') || 'email',
        membershipInterest: searchParams.get('membershipInterest') === 'true'
      }
      html = generateContactFormEmailHtml(contactData, {
        siteUrl: process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com',
        logoUrl: `${process.env.NEXTAUTH_URL || 'https://dev.businessassociationsa.com'}/images/BASA-LOGO.png`
      })
      break
    default:
      html = '<h1>Template not found</h1>'
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
} 