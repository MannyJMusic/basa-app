import formData from 'form-data'
import Mailgun from 'mailgun.js'

// Initialize Mailgun
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
})

const DOMAIN = process.env.MAILGUN_DOMAIN!
const FROM_EMAIL = process.env.FROM_EMAIL || `noreply@${DOMAIN}`
const FROM_NAME = process.env.FROM_NAME || 'BASA'
const SITE_URL = process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'development' ? 'https://dev.businessassociationsa.com' : 'https://businessassociationsa.com')

// Base email sending function
async function sendEmail(to: string, subject: string, html: string, options: {
  from?: string
  fromName?: string
  replyTo?: string
  attachments?: Array<{ filename: string; data: Buffer; contentType: string }>
} = {}) {
  try {
    const fromName = options.fromName || FROM_NAME
    const fromEmail = options.from || FROM_EMAIL
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail

    const messageData = {
      from: from,
      to: [to],
      subject: subject,
      html: html,
      'h:Reply-To': options.replyTo || 'info@businessassociationsa.com',
      'h:X-Mailgun-Variables': JSON.stringify({
        sent_at: new Date().toISOString(),
        template: 'basa'
      })
    }

    if (options.attachments) {
      (messageData as any).attachments = options.attachments
    }
    console.log('Sending Test',DOMAIN,FROM_EMAIL,SITE_URL)

    const response = await mg.messages.create(DOMAIN, messageData)
    console.log(`Email sent successfully to ${to}:`, response.id)
    return response
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    throw error
  }
}

// BASA Welcome Email Template
export function generateWelcomeEmailHtml(firstName: string, activationUrl: string, options: { 
  siteUrl?: string
  logoUrl?: string
} = {}) {
  const siteUrl = options.siteUrl || SITE_URL
  const logoUrl = options.logoUrl || `${siteUrl}/images/logos/BASA%20-%20LOG%20-SIDE2%20-%20WHITE%20-PROOF.png`
  
  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to BASA - Activate Your Account</title>
  
  <style>
    /* BASA Email Styles */
    .basa-gradient-primary {
      background: linear-gradient(135deg, #1B365D 0%, #15294d 100%);
    }
    .basa-gradient-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
    }
    .basa-gradient-accent {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
    }
    .basa-gradient-header {
      background: linear-gradient(135deg, #1B365D 0%, #2C5282 50%, #1B365D 100%);
    }
    .basa-text-navy {
      color: #1B365D;
    }
    .basa-text-gold {
      color: #FFD700;
    }
    .basa-text-teal {
      color: #17A2B8;
    }
    .basa-text-white {
      color: #ffffff;
    }
    .basa-bg-navy {
      background-color: #1B365D;
    }
    .basa-bg-gold {
      background-color: #FFD700;
    }
    .basa-bg-teal {
      background-color: #17A2B8;
    }
    .basa-bg-warm {
      background-color: #fefbf7;
    }
    .basa-bg-light-navy {
      background-color: #f8fafc;
    }
    .basa-border-navy {
      border-color: #1B365D;
    }
    .basa-border-gold {
      border-color: #FFD700;
    }
    .basa-border-teal {
      border-color: #17A2B8;
    }

    /* Logo container styles */
    .basa-logo-container {
      background: linear-gradient(135deg, #1B365D 0%, #2C5282 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(27, 54, 93, 0.15);
    }
    
    /* Responsive styles */
    @media screen {
      img {
        max-width: 100%;
      }
      .basa-font-sans {
        font-family: -apple-system, "Segoe UI", sans-serif !important;
      }
    }
    
    @media (max-width: 640px) {
      u ~ div .wrapper {
        min-width: 100vw;
      }
      .sm-block {
        display: block !important;
      }
      .sm-h-16 {
        height: 16px !important;
      }
      .sm-h-24 {
        height: 24px !important;
      }
      .sm-h-32 {
        height: 32px !important;
      }
      .sm-py-16 {
        padding-top: 16px !important;
        padding-bottom: 16px !important;
      }
      .sm-px-16 {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .sm-py-24 {
        padding-top: 24px !important;
        padding-bottom: 24px !important;
      }
      .sm-text-14 {
        font-size: 14px !important;
      }
      .sm-w-full {
        width: 100% !important;
      }
      .basa-logo-container {
        padding: 16px !important;
        margin-bottom: 24px !important;
      }
    }
    
    /* Hover effects */
    .basa-hover-underline:hover {
      text-decoration: underline !important;
    }
    .basa-hover-gold:hover {
      color: #FFC300 !important;
    }
    .basa-hover-teal:hover {
      color: #1391a5 !important;
    }
    .basa-hover-navy:hover {
      color: #15294d !important;
    }

    /* Button styles */
    .basa-btn-primary {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
      color: #ffffff;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
    }
    .basa-btn-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
      color: #1B365D;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }
    .basa-btn-outline {
      background: #ffffff;
      color: #1B365D;
      padding: 14px 30px;
      border: 2px solid #1B365D;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
    }
  </style>
</head>
<body class="basa-font-sans" lang="en" style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #ffffff;">
  
  <table class="wrapper" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="background-color: #ffffff;">
        <table class="sm-w-full" style="width: 640px;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="sm-px-16 sm-py-24" style="padding-left: 40px; padding-right: 40px; padding-top: 48px; padding-bottom: 48px;" bgcolor="#ffffff">
              
              <!-- BASA Header with Logo -->
              <div class="basa-logo-container" style="text-align: center;">
                <a href="${siteUrl}" style="text-decoration: none;">
                  <img src="${logoUrl}" 
                       alt="Business Association of San Antonio" 
                       width="220" 
                       style="line-height: 100%; vertical-align: middle; border: 0; filter: brightness(1.1) contrast(1.1);">
                </a>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #ffffff; opacity: 0.9; font-weight: 500;">
                  Connecting, growing, and giving back to the San Antonio business community
                </p>
              </div>

              <!-- Welcome Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 32px; font-weight: 700; line-height: 1.2; margin: 0; color: #1B365D;">
                  Welcome to BASA! 👋
                </h1>
                <p style="font-size: 18px; line-height: 1.5; margin: 16px 0 0 0; color: #64748b;">
                  We're excited to have you join the Business Association of San Antonio
                </p>
              </div>

              <!-- Welcome Message -->
              <div style="background: linear-gradient(135deg, #fefbf7 0%, #ffffff 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;">
                  Hi ${firstName},
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;">
                  Thank you for joining BASA! You're now part of a community dedicated to connecting, growing, and giving back to the San Antonio business ecosystem.
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #334155;">
                  To complete your registration and access all member benefits, please activate your account by clicking the button below.
                </p>
              </div>

              <!-- Activation Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <table class="sm-w-full" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center">
                      <a href="${activationUrl}"
                         class="basa-btn-primary sm-block sm-py-16"
                         style="display: inline-block; font-weight: 700; line-height: 1; padding: 20px 40px; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 8px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);">
                        Activate Your Account
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What's Next Section -->
              <div style="margin-bottom: 32px;">
                <h2 style="font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0 0 24px 0; color: #1B365D;">
                  What's Next?
                </h2>

                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; vertical-align: top; padding-right: 16px; width: 50%;">
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; height: 100%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);">
                          <span style="font-size: 24px;">🎯</span>
                        </div>
                        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #1B365D;">
                          Complete Your Profile
                        </h3>
                        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                          Add your bio, skills, and experience to help other members discover you.
                        </p>
                      </div>
                    </div>

                    <div style="display: table-cell; vertical-align: top; padding-left: 16px; width: 50%;">
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; height: 100%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);">
                          <span style="font-size: 24px;">🤝</span>
                        </div>
                        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #1B365D;">
                          Connect & Network
                        </h3>
                        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                          Browse our member directory and start building meaningful connections.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Member Benefits -->
              <div style="background: linear-gradient(135deg, #1B365D 0%, #15294d 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(27, 54, 93, 0.15);">
                <h2 style="font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0 0 24px 0; color: #ffffff;">
                  Your Member Benefits
                </h2>

                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; vertical-align: top; padding-right: 12px; width: 50%;">
                      <ul style="margin: 0; padding-left: 20px; color: #ffffff;">
                        <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Access to exclusive networking events</li>
                        <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Member directory and messaging</li>
                        <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Job board and career resources</li>
                      </ul>
                    </div>
                    <div style="display: table-cell; vertical-align: top; padding-left: 12px; width: 50%;">
                      <ul style="margin: 0; padding-left: 20px; color: #ffffff;">
                        <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Mentorship opportunities</li>
                        <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Educational workshops and talks</li>
                        <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Community service projects</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Links -->
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 16px 0; color: #334155;">
                  Ready to get started? Here are some quick links:
                </p>

                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/events"
                     class="basa-text-teal basa-hover-underline"
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #17A2B8; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(23, 162, 184, 0.1);">
                    View Events
                  </a>
                </div>

                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/members"
                     class="basa-text-navy basa-hover-underline"
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #1B365D; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(27, 54, 93, 0.1);">
                    Browse Members
                  </a>
                </div>

                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/resources"
                     class="basa-text-gold basa-hover-underline"
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #FFD700; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(255, 215, 0, 0.1);">
                    Resources
                  </a>
                </div>
              </div>

              <!-- Security Note -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-left: 4px solid #17A2B8; padding: 16px; border-radius: 0 8px 8px 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                  <strong>Security Note:</strong> This activation link will expire in 24 hours. If you didn't create this account, please ignore this email or contact us immediately.
                </p>
              </div>

              <!-- BASA Footer -->
              <div style="text-align: left; margin-top: 48px;">
                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding-bottom: 16px; padding-top: 32px;">
                      <div style="background: linear-gradient(90deg, #1B365D 0%, #17A2B8 50%, #FFD700 100%); height: 2px; line-height: 1px; border-radius: 1px;">&nbsp;</div>
                    </td>
                  </tr>
                </table>

                <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 8px; padding: 24px; margin-top: 16px;">
                  <p style="line-height: 16px; margin: 0; margin-bottom: 8px; color: #1B365D; font-size: 14px; font-weight: 600;">
                    Business Association of San Antonio
                  </p>
                  <p style="line-height: 16px; margin: 0; margin-bottom: 8px; color: #64748b; font-size: 12px;">
                    Connecting, growing, and giving back to the San Antonio business community
                  </p>
                  <p style="line-height: 16px; margin: 0; margin-bottom: 16px; color: #64748b; font-size: 12px;">
                    If you have any questions, reply to this email or contact us at
                    <a href="mailto:info@businessassociationsa.com" class="basa-text-teal basa-hover-underline" style="text-decoration: none;">info@businessassociationsa.com</a>
                  </p>
                  <p style="line-height: 16px; margin: 0; color: #64748b; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Business Association of San Antonio. All rights reserved.
                  </p>
                </div>
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// BASA Email Functions

export async function sendWelcomeEmail(
  email: string, 
  firstName: string, 
  activationUrl: string,
  options: { 
    siteUrl?: string
    logoUrl?: string
    fromName?: string
  } = {}
) {
  try {
    const html = generateWelcomeEmailHtml(firstName, activationUrl, options)
    const response = await sendEmail(email, 'Welcome to BASA - Activate Your Account', html, {
      fromName: options.fromName
    })
    return {
      success: true,
      messageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  firstName: string, 
  resetUrl: string,
  options: { 
    siteUrl?: string
    logoUrl?: string
    fromName?: string
  } = {}
) {
  try {
    const html = generatePasswordResetEmailHtml(firstName, resetUrl, options)
    const response = await sendEmail(email, 'Reset Your BASA Password', html, {
      fromName: options.fromName
    })
    return {
      success: true,
      messageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendEventInvitationEmail(
  email: string,
  firstName: string,
  event: {
    title: string
    date: Date
    time: string
    location: string
    address: string
    capacity: number
    price: number
    nonMemberPrice?: number
    description?: string
    speakers?: Array<{ name: string; title: string }>
    rsvpUrl: string
    calendarUrl: string
    shareUrl: string
  },
  options: { 
    siteUrl?: string
    logoUrl?: string
    fromName?: string
  } = {}
) {
  try {
    const html = generateEventInvitationEmailHtml(firstName, event, options)
    const response = await sendEmail(email, `You're Invited: ${event.title}`, html, {
      fromName: options.fromName
    })
    return {
      success: true,
      messageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendPaymentReceiptEmail(
  email: string,
  firstName: string,
  paymentData: {
    paymentId: string
    amount: number
    currency: string
    cart: Array<{ tierId: string; quantity: number; price: number; name: string }>
    customerInfo: any
    businessInfo: any
    paymentDate: string
  },
  options: { 
    siteUrl?: string
    logoUrl?: string
    fromName?: string
  } = {}
) {
  try {
    const html = generatePaymentReceiptEmailHtml(firstName, paymentData, options)
    const response = await sendEmail(email, 'BASA Membership Payment Receipt', html, {
      fromName: options.fromName
    })
    return {
      success: true,
      messageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendMembershipInvitationEmail(
  email: string,
  name: string,
  tierId: string,
  options: { 
    siteUrl?: string
    logoUrl?: string
    fromName?: string
  } = {}
) {
  try {
    const html = generateMembershipInvitationEmailHtml(name, tierId, options)
    const response = await sendEmail(email, 'You\'re Invited to Join BASA', html, {
      fromName: options.fromName
    })
    return {
      success: true,
      messageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Email validation and rate limiting
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Simple in-memory rate limiting (consider using Redis in production)
const emailRateLimit = new Map<string, { count: number; resetTime: number }>()

export function isRateLimited(email: string): boolean {
  const now = Date.now()
  const limit = emailRateLimit.get(email)
  
  if (!limit || now > limit.resetTime) {
    emailRateLimit.set(email, { count: 1, resetTime: now + 3600000 }) // 1 hour
    return false
  }
  
  if (limit.count >= 5) { // Max 5 emails per hour
    return true
  }
  
  limit.count++
  return false
}

// Export the base sendEmail function for custom emails
export { sendEmail }

// BASA Password Reset Email Template
export function generatePasswordResetEmailHtml(firstName: string, resetUrl: string, options: { 
  siteUrl?: string
  logoUrl?: string
} = {}) {
  const siteUrl = options.siteUrl || SITE_URL
  const logoUrl = options.logoUrl || `${siteUrl}/images/logos/BASA%20-%20LOG%20-SIDE2%20-%20WHITE%20-PROOF.png`
  
  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Reset Your BASA Password</title>
  
  <style>
    /* BASA Email Styles */
    .basa-gradient-primary {
      background: linear-gradient(135deg, #1B365D 0%, #15294d 100%);
    }
    .basa-gradient-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
    }
    .basa-gradient-accent {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
    }
    .basa-gradient-header {
      background: linear-gradient(135deg, #1B365D 0%, #2C5282 50%, #1B365D 100%);
    }
    .basa-text-navy {
      color: #1B365D;
    }
    .basa-text-gold {
      color: #FFD700;
    }
    .basa-text-teal {
      color: #17A2B8;
    }
    .basa-text-white {
      color: #ffffff;
    }
    .basa-bg-navy {
      background-color: #1B365D;
    }
    .basa-bg-gold {
      background-color: #FFD700;
    }
    .basa-bg-teal {
      background-color: #17A2B8;
    }
    .basa-bg-warm {
      background-color: #fefbf7;
    }
    .basa-bg-light-navy {
      background-color: #f8fafc;
    }
    .basa-border-navy {
      border-color: #1B365D;
    }
    .basa-border-gold {
      border-color: #FFD700;
    }
    .basa-border-teal {
      border-color: #17A2B8;
    }
    .basa-hover-underline:hover {
      text-decoration: underline !important;
    }
    .basa-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
    }
    .basa-button:hover {
      background: linear-gradient(135deg, #1391a5 0%, #117a8a 100%);
    }
    .basa-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .basa-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 24px 0;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table class="wrapper" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="background-color: #f8fafc; padding: 20px 0;">
        <table class="sm-w-full" style="width: 600px; max-width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="basa-card" style="padding: 40px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${logoUrl}" alt="BASA Logo" style="height: 60px; width: auto; margin-bottom: 16px;">
                <h1 class="basa-text-navy" style="margin: 0; font-size: 24px; font-weight: 700;">Reset Your Password</h1>
                <p class="basa-text-teal" style="margin: 8px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
              </div>

              <!-- Content -->
              <div style="margin-bottom: 32px;">
                <h2 class="basa-text-navy" style="margin: 0 0 16px 0; font-size: 20px;">Hello ${firstName},</h2>
                <p style="color: #64748b; line-height: 1.6; margin-bottom: 16px;">
                  We received a request to reset your password for your BASA account. If you didn't make this request, you can safely ignore this email.
                </p>
                <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                  To reset your password, click the button below. This link will expire in 1 hour for security reasons.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" class="basa-button" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #64748b; line-height: 1.6; margin-bottom: 16px; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #17A2B8; line-height: 1.6; margin-bottom: 24px; font-size: 14px; word-break: break-all;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Security Notice -->
              <div class="basa-card" style="background: #fefbf7; border-left: 4px solid #FFD700; padding: 16px; margin-bottom: 24px;">
                <h3 class="basa-text-navy" style="margin: 0 0 8px 0; font-size: 16px;">🔒 Security Notice</h3>
                <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">
                  This password reset link will expire in 1 hour. If you need a new link, please request another password reset from your account settings.
                </p>
              </div>

              <!-- Footer -->
              <div class="basa-divider"></div>
              <div style="text-align: center;">
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px 0; font-size: 14px;">
                  Connecting, growing, and giving back to the San Antonio business community
                </p>
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px 0; font-size: 12px;">
                  If you have any questions, reply to this email or contact us at
                  <a href="mailto:info@businessassociationsa.com" class="basa-text-teal basa-hover-underline" style="text-decoration: none;">info@businessassociationsa.com</a>
                </p>
                <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} Business Association of San Antonio. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// BASA Event Invitation Email Template
export function generateEventInvitationEmailHtml(firstName: string, event: {
  title: string
  date: Date
  time: string
  location: string
  address: string
  capacity: number
  price: number
  nonMemberPrice?: number
  description?: string
  speakers?: Array<{ name: string; title: string }>
  rsvpUrl: string
  calendarUrl: string
  shareUrl: string
}, options: { 
  siteUrl?: string
  logoUrl?: string
} = {}) {
  const siteUrl = options.siteUrl || SITE_URL
  const logoUrl = options.logoUrl || `${siteUrl}/images/logos/BASA%20-%20LOG%20-SIDE2%20-%20WHITE%20-PROOF.png`
  
  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>You're Invited: ${event.title}</title>
  
  <style>
    /* BASA Email Styles */
    .basa-gradient-primary {
      background: linear-gradient(135deg, #1B365D 0%, #15294d 100%);
    }
    .basa-gradient-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
    }
    .basa-gradient-accent {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
    }
    .basa-gradient-header {
      background: linear-gradient(135deg, #1B365D 0%, #2C5282 50%, #1B365D 100%);
    }
    .basa-text-navy {
      color: #1B365D;
    }
    .basa-text-gold {
      color: #FFD700;
    }
    .basa-text-teal {
      color: #17A2B8;
    }
    .basa-text-white {
      color: #ffffff;
    }
    .basa-bg-navy {
      background-color: #1B365D;
    }
    .basa-bg-gold {
      background-color: #FFD700;
    }
    .basa-bg-teal {
      background-color: #17A2B8;
    }
    .basa-bg-warm {
      background-color: #fefbf7;
    }
    .basa-bg-light-navy {
      background-color: #f8fafc;
    }
    .basa-border-navy {
      border-color: #1B365D;
    }
    .basa-border-gold {
      border-color: #FFD700;
    }
    .basa-border-teal {
      border-color: #17A2B8;
    }

    /* Logo container styles */
    .basa-logo-container {
      background: linear-gradient(135deg, #1B365D 0%, #2C5282 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(27, 54, 93, 0.15);
    }
    
    /* Responsive styles */
    @media screen {
      img {
        max-width: 100%;
      }
      .basa-font-sans {
        font-family: -apple-system, "Segoe UI", sans-serif !important;
      }
    }
    
    @media (max-width: 640px) {
      u ~ div .wrapper {
        min-width: 100vw;
      }
      .sm-block {
        display: block !important;
      }
      .sm-h-16 {
        height: 16px !important;
      }
      .sm-h-24 {
        height: 24px !important;
      }
      .sm-h-32 {
        height: 32px !important;
      }
      .sm-py-16 {
        padding-top: 16px !important;
        padding-bottom: 16px !important;
      }
      .sm-px-16 {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .sm-py-24 {
        padding-top: 24px !important;
        padding-bottom: 24px !important;
      }
      .sm-text-14 {
        font-size: 14px !important;
      }
      .sm-w-full {
        width: 100% !important;
      }
      .basa-logo-container {
        padding: 16px !important;
        margin-bottom: 24px !important;
      }
    }
    
    /* Hover effects */
    .basa-hover-underline:hover {
      text-decoration: underline !important;
    }
    .basa-hover-gold:hover {
      color: #FFC300 !important;
    }
    .basa-hover-teal:hover {
      color: #1391a5 !important;
    }
    .basa-hover-navy:hover {
      color: #15294d !important;
    }

    /* Button styles */
    .basa-btn-primary {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
      color: #ffffff;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
    }
    .basa-btn-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
      color: #1B365D;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }
    .basa-btn-outline {
      background: #ffffff;
      color: #1B365D;
      padding: 14px 30px;
      border: 2px solid #1B365D;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
    }
  </style>
</head>
<body class="basa-font-sans" lang="en" style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #ffffff;">
  
  <table class="wrapper" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="background-color: #ffffff;">
        <table class="sm-w-full" style="width: 640px;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="sm-px-16 sm-py-24" style="padding-left: 40px; padding-right: 40px; padding-top: 48px; padding-bottom: 48px;" bgcolor="#ffffff">
              
              <!-- BASA Header with Logo -->
              <div class="basa-logo-container" style="text-align: center;">
                <a href="${siteUrl}" style="text-decoration: none;">
                  <img src="${logoUrl}" 
                       alt="Business Association of San Antonio" 
                       width="220" 
                       style="line-height: 100%; vertical-align: middle; border: 0; filter: brightness(1.1) contrast(1.1);">
                </a>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #ffffff; opacity: 0.9; font-weight: 500;">
                  Connecting, growing, and giving back to the San Antonio business community
                </p>
              </div>

              <!-- Event Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 32px; font-weight: 700; line-height: 1.2; margin: 0; color: #1B365D;">
                  You're Invited! 🎉
                </h1>
                <p style="font-size: 18px; line-height: 1.5; margin: 16px 0 0 0; color: #64748b;">
                  Join us for an exciting BASA event
                </p>
              </div>

              <!-- Event Details Card -->
              <div style="background: linear-gradient(135deg, #fefbf7 0%, #ffffff 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <h2 style="font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0 0 24px 0; color: #1B365D; text-align: center;">
                  ${event.title}
                </h2>

                <div style="display: table; width: 100%; margin-bottom: 24px;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; vertical-align: top; padding-right: 16px; width: 50%;">
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; height: 100%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);">
                          <span style="font-size: 20px;">📅</span>
                        </div>
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1B365D;">
                          Date & Time
                        </h3>
                        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                          ${event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
                          ${event.time}
                        </p>
                      </div>
                    </div>

                    <div style="display: table-cell; vertical-align: top; padding-left: 16px; width: 50%;">
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; height: 100%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);">
                          <span style="font-size: 20px;">📍</span>
                        </div>
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1B365D;">
                          Location
                        </h3>
                        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                          ${event.location}<br>
                          ${event.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="display: table; width: 100%; margin-bottom: 24px;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; vertical-align: top; padding-right: 16px; width: 50%;">
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; height: 100%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1B365D 0%, #15294d 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(27, 54, 93, 0.3);">
                          <span style="font-size: 20px;">👥</span>
                        </div>
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1B365D;">
                          Capacity
                        </h3>
                        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                          ${event.capacity} attendees
                        </p>
                      </div>
                    </div>

                    <div style="display: table-cell; vertical-align: top; padding-left: 16px; width: 50%;">
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; height: 100%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);">
                          <span style="font-size: 20px;">💰</span>
                        </div>
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1B365D;">
                          Price
                        </h3>
                        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                          $${event.price} per person
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                ${event.description ? `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #1B365D;">
                    About This Event
                  </h3>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #64748b;">
                    ${event.description}
                  </p>
                </div>
                ` : ''}
              </div>

              <!-- RSVP Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <table class="sm-w-full" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center">
                      <a href="${event.rsvpUrl}"
                         class="basa-btn-primary sm-block sm-py-16"
                         style="display: inline-block; font-weight: 700; line-height: 1; padding: 20px 40px; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 8px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);">
                        RSVP Now
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Event Actions -->
              <div style="background: linear-gradient(135deg, #1B365D 0%, #15294d 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(27, 54, 93, 0.15);">
                <h2 style="font-size: 20px; font-weight: 600; line-height: 1.3; margin: 0 0 24px 0; color: #ffffff; text-align: center;">
                  Event Actions
                </h2>

                <div style="text-align: center;">
                  <div style="display: inline-block; margin: 0 8px;">
                    <a href="${event.calendarUrl}"
                       class="basa-text-white basa-hover-underline"
                       style="display: inline-block; padding: 12px 24px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; backdrop-filter: blur(10px);">
                      📅 Add to Calendar
                    </a>
                  </div>

                  <div style="display: inline-block; margin: 0 8px;">
                    <a href="${event.shareUrl}"
                       class="basa-text-white basa-hover-underline"
                       style="display: inline-block; padding: 12px 24px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; backdrop-filter: blur(10px);">
                      📤 Share Event
                    </a>
                  </div>
                </div>
              </div>

              <!-- What to Expect -->
              <div style="margin-bottom: 32px;">
                <h2 style="font-size: 20px; font-weight: 600; line-height: 1.3; margin: 0 0 16px 0; color: #1B365D;">
                  What to Expect
                </h2>
                
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <ul style="margin: 0; padding-left: 20px; color: #64748b;">
                    <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Networking with fellow BASA members</li>
                    <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Professional development opportunities</li>
                    <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">Refreshments and light snacks</li>
                    <li style="margin-bottom: 0; font-size: 14px; line-height: 1.5;">Valuable insights and connections</li>
                  </ul>
                </div>
              </div>

              <!-- Quick Links -->
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 16px 0; color: #334155;">
                  Explore more BASA events and resources:
                </p>

                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/events"
                     class="basa-text-teal basa-hover-underline"
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #17A2B8; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(23, 162, 184, 0.1);">
                    All Events
                  </a>
                </div>

                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/members"
                     class="basa-text-navy basa-hover-underline"
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #1B365D; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(27, 54, 93, 0.1);">
                    Member Directory
                  </a>
                </div>
              </div>

              <!-- Contact Info -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-left: 4px solid #FFD700; padding: 16px; border-radius: 0 8px 8px 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                  <strong>Questions?</strong> Contact us at <a href="mailto:events@businessassociationsa.com" class="basa-text-teal basa-hover-underline" style="text-decoration: none;">events@businessassociationsa.com</a> or call (210) 555-0123.
                </p>
              </div>

              <!-- BASA Footer -->
              <div style="text-align: left; margin-top: 48px;">
                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding-bottom: 16px; padding-top: 32px;">
                      <div style="background: linear-gradient(90deg, #1B365D 0%, #17A2B8 50%, #FFD700 100%); height: 2px; line-height: 1px; border-radius: 1px;">&nbsp;</div>
                    </td>
                  </tr>
                </table>

                <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 8px; padding: 24px; margin-top: 16px;">
                  <p style="line-height: 16px; margin: 0; margin-bottom: 8px; color: #1B365D; font-size: 14px; font-weight: 600;">
                    Business Association of San Antonio
                  </p>
                  <p style="line-height: 16px; margin: 0; margin-bottom: 8px; color: #64748b; font-size: 12px;">
                    Connecting, growing, and giving back to the San Antonio business community
                  </p>
                  <p style="line-height: 16px; margin: 0; margin-bottom: 16px; color: #64748b; font-size: 12px;">
                    If you have any questions, reply to this email or contact us at
                    <a href="mailto:info@businessassociationsa.com" class="basa-text-teal basa-hover-underline" style="text-decoration: none;">info@businessassociationsa.com</a>
                  </p>
                  <p style="line-height: 16px; margin: 0; color: #64748b; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Business Association of San Antonio. All rights reserved.
                  </p>
                </div>
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// BASA Payment Receipt Email Template
export function generatePaymentReceiptEmailHtml(firstName: string, paymentData: {
  paymentId: string
  amount: number
  currency: string
  cart: Array<{ tierId: string; quantity: number; price: number; name: string }>
  customerInfo: any
  businessInfo: any
  paymentDate: string
}, options: { 
  siteUrl?: string
  logoUrl?: string
} = {}) {
  const siteUrl = options.siteUrl || SITE_URL
  const logoUrl = options.logoUrl || `${siteUrl}/images/BASA-LOGO.png`
  const paymentDate = new Date(paymentData.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>BASA Membership Payment Receipt</title>
  
  <style>
    /* BASA Email Styles */
    .basa-gradient-primary {
      background: linear-gradient(135deg, #1B365D 0%, #15294d 100%);
    }
    .basa-gradient-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
    }
    .basa-gradient-accent {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
    }
    .basa-text-navy {
      color: #1B365D;
    }
    .basa-text-gold {
      color: #FFD700;
    }
    .basa-text-teal {
      color: #17A2B8;
    }
    .basa-text-white {
      color: #ffffff;
    }
    .basa-bg-navy {
      background-color: #1B365D;
    }
    .basa-bg-gold {
      background-color: #FFD700;
    }
    .basa-bg-teal {
      background-color: #17A2B8;
    }
    .basa-bg-warm {
      background-color: #fefbf7;
    }
    .basa-bg-light-navy {
      background-color: #f8fafc;
    }
    .basa-border-navy {
      border-color: #1B365D;
    }
    .basa-border-gold {
      border-color: #FFD700;
    }
    .basa-border-teal {
      border-color: #17A2B8;
    }
    .basa-hover-underline:hover {
      text-decoration: underline !important;
    }
    .basa-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
    }
    .basa-button:hover {
      background: linear-gradient(135deg, #1391a5 0%, #117a8a 100%);
    }
    .basa-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .basa-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 24px 0;
    }
    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .receipt-table th,
    .receipt-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .receipt-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1B365D;
    }
    .receipt-table td {
      color: #64748b;
    }
    .total-row {
      font-weight: 600;
      color: #1B365D;
      font-size: 18px;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table class="wrapper" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="background-color: #f8fafc; padding: 20px 0;">
        <table class="sm-w-full" style="width: 600px; max-width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="basa-card" style="padding: 40px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${logoUrl}" alt="BASA Logo" style="height: 60px; width: auto; margin-bottom: 16px;">
                <h1 class="basa-text-navy" style="margin: 0; font-size: 24px; font-weight: 700;">Payment Receipt</h1>
                <p class="basa-text-teal" style="margin: 8px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
              </div>

              <!-- Success Message -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 class="basa-text-navy" style="margin: 0 0 8px 0; font-size: 18px;">✅ Payment Successful!</h2>
                <p style="color: #64748b; line-height: 1.6; margin: 0;">
                  Thank you for your membership payment, ${firstName}! Your BASA membership is now active.
                </p>
              </div>

              <!-- Receipt Details -->
              <div style="margin-bottom: 24px;">
                <h3 class="basa-text-navy" style="margin: 0 0 16px 0; font-size: 18px;">Receipt Details</h3>
                <table class="receipt-table">
                  <tr>
                    <th>Payment ID</th>
                    <td>${paymentData.paymentId}</td>
                  </tr>
                  <tr>
                    <th>Date</th>
                    <td>${paymentDate}</td>
                  </tr>
                  <tr>
                    <th>Amount</th>
                    <td>$${paymentData.amount.toFixed(2)} ${paymentData.currency.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td style="color: #059669; font-weight: 600;">Paid</td>
                  </tr>
                </table>
              </div>

              <!-- Membership Details -->
              <div style="margin-bottom: 24px;">
                <h3 class="basa-text-navy" style="margin: 0 0 16px 0; font-size: 18px;">Membership Details</h3>
                <table class="receipt-table">
                  <thead>
                    <tr>
                      <th>Membership Type</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${paymentData.cart.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right;">Total:</td>
                      <td>$${paymentData.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Next Steps -->
              <div class="basa-card" style="background: #fefbf7; border-left: 4px solid #FFD700; padding: 16px; margin-bottom: 24px;">
                <h3 class="basa-text-navy" style="margin: 0 0 12px 0; font-size: 16px;">🎉 Welcome to BASA!</h3>
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 12px 0; font-size: 14px;">
                  Your membership is now active. Here's what you can do next:
                </p>
                <ul style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px; padding-left: 20px;">
                  <li>Complete your member profile</li>
                  <li>Browse upcoming events and networking opportunities</li>
                  <li>Connect with other members in our directory</li>
                  <li>Access exclusive business resources</li>
                </ul>
              </div>

              <!-- Action Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${siteUrl}/dashboard" class="basa-button" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Access Your Dashboard
                </a>
              </div>

              <!-- Footer -->
              <div class="basa-divider"></div>
              <div style="text-align: center;">
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px 0; font-size: 14px;">
                  Connecting, growing, and giving back to the San Antonio business community
                </p>
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px 0; font-size: 12px;">
                  If you have any questions, reply to this email or contact us at
                  <a href="mailto:info@businessassociationsa.com" class="basa-text-teal basa-hover-underline" style="text-decoration: none;">info@businessassociationsa.com</a>
                </p>
                <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} Business Association of San Antonio. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// BASA Membership Invitation Email Template
export function generateMembershipInvitationEmailHtml(name: string, tierId: string, options: { 
  siteUrl?: string
  logoUrl?: string
} = {}) {
  const siteUrl = options.siteUrl || SITE_URL
  const logoUrl = options.logoUrl || `${siteUrl}/images/BASA-LOGO.png`
  
  const tierNames: Record<string, string> = {
    'meeting-member': 'Meeting Member',
    'associate-member': 'Associate Member',
    'trio-member': 'TRIO Member',
    'class-resource-member': 'Class Resource Member',
    'nag-resource-member': 'NAG Resource Member',
    'training-resource-member': 'Training Resource Member'
  }
  
  const tierName = tierNames[tierId] || 'BASA Member'
  
  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>You're Invited to Join BASA</title>
  
  <style>
    /* BASA Email Styles */
    .basa-gradient-primary {
      background: linear-gradient(135deg, #1B365D 0%, #15294d 100%);
    }
    .basa-gradient-secondary {
      background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
    }
    .basa-gradient-accent {
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
    }
    .basa-text-navy {
      color: #1B365D;
    }
    .basa-text-gold {
      color: #FFD700;
    }
    .basa-text-teal {
      color: #17A2B8;
    }
    .basa-text-white {
      color: #ffffff;
    }
    .basa-bg-navy {
      background-color: #1B365D;
    }
    .basa-bg-gold {
      background-color: #FFD700;
    }
    .basa-bg-teal {
      background-color: #17A2B8;
    }
    .basa-bg-warm {
      background-color: #fefbf7;
    }
    .basa-bg-light-navy {
      background-color: #f8fafc;
    }
    .basa-border-navy {
      border-color: #1B365D;
    }
    .basa-border-gold {
      border-color: #FFD700;
    }
    .basa-border-teal {
      border-color: #17A2B8;
    }
    .basa-hover-underline:hover {
      text-decoration: underline !important;
    }
    .basa-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
    }
    .basa-button:hover {
      background: linear-gradient(135deg, #1391a5 0%, #117a8a 100%);
    }
    .basa-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .basa-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 24px 0;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table class="wrapper" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="background-color: #f8fafc; padding: 20px 0;">
        <table class="sm-w-full" style="width: 600px; max-width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="basa-card" style="padding: 40px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${logoUrl}" alt="BASA Logo" style="height: 60px; width: auto; margin-bottom: 16px;">
                <h1 class="basa-text-navy" style="margin: 0; font-size: 24px; font-weight: 700;">You're Invited!</h1>
                <p class="basa-text-teal" style="margin: 8px 0 0 0; font-size: 16px;">Business Association of San Antonio</p>
              </div>

              <!-- Content -->
              <div style="margin-bottom: 32px;">
                <h2 class="basa-text-navy" style="margin: 0 0 16px 0; font-size: 20px;">Hello ${name},</h2>
                <p style="color: #64748b; line-height: 1.6; margin-bottom: 16px;">
                  You've been invited to join the Business Association of San Antonio (BASA) as a <strong>${tierName}</strong>!
                </p>
                <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                  BASA is the premier business association in San Antonio, connecting entrepreneurs and business leaders for growth and success. As a member, you'll have access to exclusive networking opportunities, business resources, and a supportive community of professionals.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${siteUrl}/membership/join" class="basa-button" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Accept Invitation
                  </a>
                </div>
              </div>

              <!-- Benefits -->
              <div class="basa-card" style="background: #fefbf7; border-left: 4px solid #FFD700; padding: 16px; margin-bottom: 24px;">
                <h3 class="basa-text-navy" style="margin: 0 0 12px 0; font-size: 16px;">🌟 Member Benefits</h3>
                <ul style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px; padding-left: 20px;">
                  <li>Exclusive networking events and mixers</li>
                  <li>Business directory listing</li>
                  <li>Access to member-only resources</li>
                  <li>Professional development opportunities</li>
                  <li>Community service and giving back</li>
                </ul>
              </div>

              <!-- Footer -->
              <div class="basa-divider"></div>
              <div style="text-align: center;">
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px 0; font-size: 14px;">
                  Connecting, growing, and giving back to the San Antonio business community
                </p>
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px 0; font-size: 12px;">
                  If you have any questions, reply to this email or contact us at
                  <a href="mailto:info@businessassociationsa.com" class="basa-text-teal basa-hover-underline" style="text-decoration: none;">info@businessassociationsa.com</a>
                </p>
                <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} Business Association of San Antonio. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
} 