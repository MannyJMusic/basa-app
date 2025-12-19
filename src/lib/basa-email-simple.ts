import formData from 'form-data'
import Mailgun from 'mailgun.js'
// Mailgun client type

// Lazy initialization to avoid build-time errors when env vars are not set
let _mg: ReturnType<InstanceType<typeof Mailgun>['client']> | null = null

function getMailgunClient() {
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

function getFromName(): string {
  return process.env.FROM_NAME || 'BASA'
}

function getSiteUrl(): string {
  return process.env.NEXTAUTH_URL || 'https://basa.org'
}

// Base email sending function
async function sendEmail(to: string, subject: string, html: string, options: {
  from?: string
  fromName?: string
  replyTo?: string
  attachments?: Array<{ filename: string; data: Buffer; contentType: string }>
} = {}) {
  try {
    const mg = getMailgunClient()
    const domain = getDomain()
    const defaultFromEmail = getFromEmail()
    const defaultFromName = getFromName()

    const fromName = options.fromName || defaultFromName
    const fromEmail = options.from || defaultFromEmail
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail

    const messageData = {
      from: from,
      to: [to],
      subject: subject,
      html: html,
      'h:Reply-To': options.replyTo || 'info@basa.org',
      'h:X-Mailgun-Variables': JSON.stringify({
        sent_at: new Date().toISOString(),
        template: 'basa'
      })
    }

    if (options.attachments) {
      (messageData as any).attachments = options.attachments
    }

    const response = await mg.messages.create(domain, messageData)
    console.log(`Email sent successfully to ${to}:`, response.id)
    return response
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    throw error
  }
}

// BASA Welcome Email Template
function generateWelcomeEmailHtml(firstName: string, activationUrl: string, options: { 
  siteUrl?: string
  logoUrl?: string
} = {}) {
  const siteUrl = options.siteUrl || getSiteUrl()
  const logoUrl = options.logoUrl || `${siteUrl}/images/BASA-LOGO.png`
  
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
    .basa-text-navy {
      color: #1B365D;
    }
    .basa-text-gold {
      color: #FFD700;
    }
    .basa-text-teal {
      color: #17A2B8;
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
  </style>
</head>
<body class="basa-font-sans" lang="en" style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #ffffff;">
  
  <table class="wrapper" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="background-color: #ffffff;">
        <table class="sm-w-full" style="width: 640px;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="sm-px-16 sm-py-24" style="padding-left: 40px; padding-right: 40px; padding-top: 48px; padding-bottom: 48px;" bgcolor="#ffffff">
              
              <!-- BASA Header -->
              <div style="margin-bottom: 32px; text-align: center;">
                <a href="${siteUrl}" style="text-decoration: none;">
                  <img src="${logoUrl}" 
                       alt="BASA - Bay Area Software Association" 
                       width="200" 
                       style="line-height: 100%; vertical-align: middle; border: 0;">
                </a>
              </div>

              <!-- Welcome Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 32px; font-weight: 700; line-height: 1.2; margin: 0; color: #1B365D;">
                  Welcome to BASA! 👋
                </h1>
                <p style="font-size: 18px; line-height: 1.5; margin: 16px 0 0 0; color: #64748b;">
                  We're excited to have you join the Bay Area Software Association
                </p>
              </div>

              <!-- Welcome Message -->
              <div style="background: linear-gradient(135deg, #fefbf7 0%, #ffffff 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;">
                  Hi ${firstName},
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;">
                  Thank you for joining BASA! You're now part of a community dedicated to connecting, growing, and giving back to the Bay Area tech ecosystem.
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #334155;">
                  To complete your registration and access all member benefits, please activate your account by clicking the button below.
                </p>
              </div>

              <!-- Activation Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <table class="sm-w-full" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" class="basa-gradient-accent" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);">
                      <a href="${activationUrl}" 
                         class="sm-block sm-py-16" 
                         style="display: inline-block; font-weight: 700; line-height: 1; padding: 20px 40px; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 8px;">
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
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; height: 100%;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
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
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; height: 100%;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #17A2B8 0%, #1391a5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
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
              <div style="background: linear-gradient(135deg, #1B365D 0%, #15294d 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px;">
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
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #17A2B8; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View Events
                  </a>
                </div>
                
                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/members" 
                     class="basa-text-navy basa-hover-underline" 
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #1B365D; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Browse Members
                  </a>
                </div>
                
                <div style="display: inline-block; margin: 0 8px;">
                  <a href="${siteUrl}/resources" 
                     class="basa-text-gold basa-hover-underline" 
                     style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px solid #FFD700; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Resources
                  </a>
                </div>
              </div>

              <!-- Security Note -->
              <div style="background: #f8fafc; border-left: 4px solid #17A2B8; padding: 16px; border-radius: 0 8px 8px 0;">
                <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #64748b;">
                  <strong>Security Note:</strong> This activation link will expire in 24 hours. If you didn't create this account, please ignore this email or contact us immediately.
                </p>
              </div>

              <!-- BASA Footer -->
              <div style="text-align: left; margin-top: 48px;">
                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding-bottom: 16px; padding-top: 32px;">
                      <div style="background-color: #e2e8f0; height: 1px; line-height: 1px;">&nbsp;</div>
                    </td>
                  </tr>
                </table>
                
                <p style="line-height: 16px; margin: 0; margin-bottom: 8px; color: #64748b; font-size: 12px;">
                  <strong>BASA - Bay Area Software Association</strong>
                </p>
                <p style="line-height: 16px; margin: 0; margin-bottom: 8px; color: #64748b; font-size: 12px;">
                  Connecting, growing, and giving back to the Bay Area tech community
                </p>
                <p style="line-height: 16px; margin: 0; margin-bottom: 16px; color: #64748b; font-size: 12px;">
                  If you have any questions, reply to this email or contact us at 
                  <a href="mailto:info@basa.org" style="color: #17A2B8; text-decoration: none;">info@basa.org</a>
                </p>
                <p style="line-height: 16px; margin: 0; color: #64748b; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} BASA. All rights reserved.
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
  const html = generateWelcomeEmailHtml(firstName, activationUrl, options)
  return sendEmail(email, 'Welcome to BASA - Activate Your Account', html, {
    fromName: options.fromName
  })
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
  // For now, use the existing template from email.ts
  const { sendPasswordResetEmail: sendResetEmail } = await import('./email')
  // Extract token from resetUrl for the email.ts function
  const resetToken = resetUrl.split('token=')[1]?.split('&')[0] || 'test123'
  return sendResetEmail(email, firstName, resetToken)
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
  // For now, use a simple template
  const siteUrl = options.siteUrl || getSiteUrl()
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1B365D;">You're Invited: ${event.title}</h1>
      <p>Hi ${firstName},</p>
      <p>You're invited to join us for: <strong>${event.title}</strong></p>
      <p><strong>Date:</strong> ${event.date.toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <a href="${event.rsvpUrl}" style="background: #17A2B8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        RSVP Now
      </a>
    </div>
  `
  return sendEmail(email, `You're Invited: ${event.title}`, html, {
    fromName: options.fromName
  })
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