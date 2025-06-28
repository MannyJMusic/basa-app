import formData from 'form-data'
import Mailgun from 'mailgun.js'
import fs from 'fs'
import path from 'path'
import * as nunjucks from 'nunjucks'

// Initialize Mailgun
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
})

const DOMAIN = process.env.MAILGUN_DOMAIN!
const FROM_EMAIL = process.env.FROM_EMAIL || `noreply@${DOMAIN}`
const SITE_URL = process.env.NEXTAUTH_URL || 'https://basa.org'

// Load email templates from the built Maizzle templates
const loadTemplate = (templateName: string): string => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'dist', 'basa', `${templateName}.html`)
    return fs.readFileSync(templatePath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error)
    throw new Error(`Template ${templateName} not found`)
  }
}

// Configure Nunjucks for template rendering
const nunjucksEnv = new nunjucks.Environment()
nunjucksEnv.addFilter('date', (date: Date, format: string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// Base email sending function
async function sendEmail(to: string, subject: string, html: string, options: {
  from?: string
  replyTo?: string
  attachments?: Array<{ filename: string; data: Buffer; contentType: string }>
} = {}) {
  try {
    const messageData = {
      from: options.from || FROM_EMAIL,
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

    const response = await mg.messages.create(DOMAIN, messageData)
    console.log(`Email sent successfully to ${to}:`, response.id)
    return response
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    throw error
  }
}

// BASA Email Functions

export async function sendWelcomeEmail(
  email: string, 
  firstName: string, 
  activationUrl: string,
  options: { 
    siteUrl?: string
    logoUrl?: string
  } = {}
) {
  const template = loadTemplate('welcome')
  
  const html = nunjucksEnv.renderString(template, {
    user: { firstName },
    activationUrl,
    page: {
      siteUrl: options.siteUrl || SITE_URL,
      logoUrl: options.logoUrl || `${SITE_URL}/images/BASA-LOGO.png`
    }
  })

  return sendEmail(email, 'Welcome to BASA - Activate Your Account', html)
}

export async function sendPasswordResetEmail(
  email: string, 
  firstName: string, 
  resetUrl: string,
  options: { 
    siteUrl?: string
    logoUrl?: string
  } = {}
) {
  const template = loadTemplate('password-reset')
  
  const html = nunjucksEnv.renderString(template, {
    user: { firstName },
    resetUrl,
    page: {
      siteUrl: options.siteUrl || SITE_URL,
      logoUrl: options.logoUrl || `${SITE_URL}/images/BASA-LOGO.png`
    }
  })

  return sendEmail(email, 'Reset Your BASA Password', html)
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
  } = {}
) {
  const template = loadTemplate('event-invitation')
  
  const html = nunjucksEnv.renderString(template, {
    user: { firstName },
    event,
    page: {
      siteUrl: options.siteUrl || SITE_URL,
      logoUrl: options.logoUrl || `${SITE_URL}/images/BASA-LOGO.png`
    }
  })

  return sendEmail(email, `You're Invited: ${event.title}`, html)
}

export async function sendNewsletterEmail(
  email: string,
  firstName: string,
  newsletter: {
    title: string
    preheader: string
    date: Date
    featuredStory?: {
      title: string
      excerpt: string
      url: string
    }
    articles: Array<{
      title: string
      excerpt: string
      url: string
    }>
    upcomingEvents?: Array<{
      title: string
      date: Date
      time: string
      location: string
      url: string
    }>
    memberSpotlight?: {
      name: string
      title: string
      company: string
      bio: string
      avatar: string
    }
    communityUpdates?: {
      newMembers: number
      eventsHosted: number
    }
  },
  options: { 
    siteUrl?: string
    logoUrl?: string
    unsubscribeUrl?: string
    preferencesUrl?: string
  } = {}
) {
  const template = loadTemplate('newsletter')
  
  const html = nunjucksEnv.renderString(template, {
    user: { firstName },
    newsletter,
    unsubscribeUrl: options.unsubscribeUrl || `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
    preferencesUrl: options.preferencesUrl || `${SITE_URL}/preferences`,
    page: {
      siteUrl: options.siteUrl || SITE_URL,
      logoUrl: options.logoUrl || `${SITE_URL}/images/BASA-LOGO.png`
    }
  })

  return sendEmail(email, `BASA Newsletter - ${newsletter.title}`, html)
}

// Utility functions for building templates
export async function buildBasaTemplates() {
  try {
    const { exec } = require('child_process')
    const util = require('util')
    const execAsync = util.promisify(exec)
    
    console.log('Building BASA email templates...')
    await execAsync('node bootstrap.js build --config config.basa.js', {
      cwd: path.join(process.cwd(), 'mail-templates')
    })
    console.log('BASA templates built successfully!')
  } catch (error) {
    console.error('Failed to build BASA templates:', error)
    throw error
  }
}

// Email validation and rate limiting (reusing from existing email.ts)
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

// Bulk email sending with rate limiting
export async function sendBulkBasaEmails(
  recipients: Array<{ email: string; firstName: string }>,
  emailFunction: (email: string, firstName: string, ...args: any[]) => Promise<any>,
  emailArgs: any[] = [],
  options: {
    delay?: number
    batchSize?: number
    onProgress?: (sent: number, total: number) => void
  } = {}
) {
  const { delay = 1000, batchSize = 10, onProgress } = options
  let sent = 0
  const total = recipients.length

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map(async (recipient) => {
        if (isRateLimited(recipient.email)) {
          console.warn(`Rate limited: ${recipient.email}`)
          return
        }
        
        try {
          await emailFunction(recipient.email, recipient.firstName, ...emailArgs)
          sent++
          if (onProgress) onProgress(sent, total)
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error)
        }
      })
    )
    
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return { sent, total }
}

// Export the base sendEmail function for custom emails
export { sendEmail } 