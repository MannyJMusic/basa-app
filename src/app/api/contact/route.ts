import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactFormEmail } from '@/lib/basa-emails'

// Contact form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredContact: z.enum(['email', 'phone']).default('email'),
  membershipInterest: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = contactFormSchema.parse(body)
    
    // Get additional information from the request
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const referrer = request.headers.get('referer') || 'Direct visit'
    
    // Send the contact form email
    await sendContactFormEmail(
      'info@businessassociationsa.com',
      validatedData,
      {
        siteUrl: process.env.NEXTAUTH_URL || 'https://app.businessassociationsa.com',
        logoUrl: `${process.env.NEXTAUTH_URL || 'https://app.businessassociationsa.com'}/images/BASA-LOGO.png`,
        ipAddress,
        userAgent,
        referrer
      }
    )
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully. We\'ll get back to you within 24 hours.' 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Contact form submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid form data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit contact form. Please try again or contact us directly.' 
      },
      { status: 500 }
    )
  }
} 