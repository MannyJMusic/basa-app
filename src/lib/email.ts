import formData from 'form-data'
import Mailgun from 'mailgun.js'
import type { IMailgunClient } from 'mailgun.js/Interfaces'

// Lazy initialization to avoid build-time errors when env vars are not set
let _mg: IMailgunClient | null = null

function getMailgunClient(): IMailgunClient {
  if (!_mg) {
    const apiKey = process.env.MAILGUN_API_KEY
    if (!apiKey) {
      throw new Error('Missing MAILGUN_API_KEY environment variable.')
    }
    const mailgun = new Mailgun(formData)
    _mg = mailgun.client({
      username: 'api',
      key: apiKey,
    })
  }
  return _mg
}

function getDomain(): string {
  const domain = process.env.MAILGUN_DOMAIN
  if (!domain) {
    throw new Error('Missing MAILGUN_DOMAIN environment variable.')
  }
  return domain
}

function getFromEmail(): string {
  return process.env.FROM_EMAIL || `noreply@${getDomain()}`
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to BASA!',
    html: (firstName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to BASA!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to the Business Association of San Antonio! We're thrilled to have you join our vibrant 
            community of entrepreneurs, business leaders, and professionals.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Complete your member profile</li>
              <li>Explore upcoming events and networking opportunities</li>
              <li>Connect with other members in our directory</li>
              <li>Access exclusive business resources</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, don't hesitate to reach out to our team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The BASA Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Business Association of San Antonio. All rights reserved.
          </p>
        </div>
      </div>
    `
  },

  passwordReset: {
    subject: 'Reset Your BASA Password',
    html: (firstName: string, resetUrl: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You requested a password reset for your BASA account. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The BASA Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Business Association of San Antonio. All rights reserved.
          </p>
        </div>
      </div>
    `
  },

  emailVerification: {
    subject: 'Verify Your BASA Email Address',
    html: (firstName: string, verificationUrl: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining BASA! To complete your registration, please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #0c5460; margin: 0; font-size: 14px;">
              <strong>Note:</strong> This verification link will expire in 24 hours.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The BASA Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Business Association of San Antonio. All rights reserved.
          </p>
        </div>
      </div>
    `
  },

  eventReminder: {
    subject: 'Reminder: Upcoming BASA Event',
    html: (firstName: string, eventTitle: string, eventDate: string, eventLocation: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Event Reminder</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder about your upcoming BASA event:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
            <p style="color: #666; margin: 10px 0;"><strong>Date:</strong> ${eventDate}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Location:</strong> ${eventLocation}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/events" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Event Details
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We look forward to seeing you there!<br>
            Best regards,<br>
            The BASA Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Business Association of San Antonio. All rights reserved.
          </p>
        </div>
      </div>
    `
  },

  newsletter: {
    subject: 'BASA Newsletter - Latest Updates',
    html: (firstName: string, content: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">BASA Newsletter</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${content}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Visit BASA
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The BASA Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Business Association of San Antonio. All rights reserved.
          </p>
        </div>
      </div>
    `
  }
}

// Email sending functions
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mg = getMailgunClient()
    const domain = getDomain()
    const fromEmail = getFromEmail()

    const msg = {
      from: fromEmail,
      to,
      subject,
      html
    }

    const response = await mg.messages.create(domain, msg)
    console.log('Email sent successfully:', response)
    return { success: true, messageId: response.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const template = emailTemplates.welcome
  return sendEmail(email, template.subject, template.html(firstName))
}

export async function sendPasswordResetEmail(email: string, firstName: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  const template = emailTemplates.passwordReset
  return sendEmail(email, template.subject, template.html(firstName, resetUrl))
}

export async function sendEmailVerification(email: string, firstName: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`
  const template = emailTemplates.emailVerification
  return sendEmail(email, template.subject, template.html(firstName, verificationUrl))
}

export async function sendEventReminder(email: string, firstName: string, eventTitle: string, eventDate: string, eventLocation: string) {
  const template = emailTemplates.eventReminder
  return sendEmail(email, template.subject, template.html(firstName, eventTitle, eventDate, eventLocation))
}

export async function sendNewsletter(email: string, firstName: string, content: string) {
  const template = emailTemplates.newsletter
  return sendEmail(email, template.subject, template.html(firstName, content))
}

// Bulk email sending
export async function sendBulkEmail(recipients: Array<{ email: string; firstName: string }>, subject: string, content: string) {
  const results = []
  
  for (const recipient of recipients) {
    try {
      const result = await sendNewsletter(recipient.email, recipient.firstName, content)
      results.push({ email: recipient.email, success: true, result })
    } catch (error) {
      results.push({ email: recipient.email, success: false, error })
    }
  }
  
  return results
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Email rate limiting (simple implementation)
const emailRateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_EMAILS_PER_HOUR = 10

export function isRateLimited(email: string): boolean {
  const now = Date.now()
  const userEmails = emailRateLimit.get(email) || []
  
  // Remove emails older than 1 hour
  const recentEmails = userEmails.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW)
  
  if (recentEmails.length >= MAX_EMAILS_PER_HOUR) {
    return true
  }
  
  // Add current email
  recentEmails.push(now)
  emailRateLimit.set(email, recentEmails)
  
  return false
} 