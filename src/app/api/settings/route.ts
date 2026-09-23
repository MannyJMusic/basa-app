import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, isResponse } from '@/lib/api-auth'

// GET /api/settings - Retrieve all settings
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    // Get the first (and only) settings record, or create default if none exists
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Create default settings
      settings = await prisma.settings.create({
        data: {}
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// Everything an admin may change. Unknown keys (the form posts back `id`,
// `createdAt`, ...) are dropped, never written (2026-09-22 audit, M-A4). Secrets
// are not settings: Stripe and mail credentials live only in the server env.
const optionalText = (max: number) => z.string().trim().max(max).nullish()
const settingsSchema = z.object({
  organizationName: z.string().trim().min(1, 'Organization name is required').max(200),
  contactEmail: z.string().trim().email('A valid contact email is required').max(254),
  phoneNumber: optionalText(40),
  website: z.string().trim().max(300).optional(),
  address: optionalText(500),
  description: optionalText(2000),
  maintenanceMode: z.boolean().optional(),
  autoApproveMembers: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  requireTwoFactor: z.boolean().optional(),
  sessionTimeout: z.number().int().min(1).max(100000).optional(),
  enforcePasswordPolicy: z.boolean().optional(),
  allowedIpAddresses: optionalText(2000),
  apiRateLimit: z.number().int().min(1).max(100000).optional(),
  notifyNewMembers: z.boolean().optional(),
  notifyPayments: z.boolean().optional(),
  notifyEventRegistrations: z.boolean().optional(),
  notifySystemAlerts: z.boolean().optional(),
  adminEmails: optionalText(2000),
  stripePublicKey: optionalText(200),
  stripeTestMode: z.boolean().optional(),
  smtpHost: optionalText(200),
  smtpPort: z.number().int().min(1).max(65535).nullish(),
  smtpUsername: optionalText(200),
  googleAnalyticsId: optionalText(50),
  googleTagManagerId: optionalText(50),
  logoUrl: optionalText(500),
  faviconUrl: optionalText(500),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
  showMemberCount: z.boolean().optional(),
  showEventCalendar: z.boolean().optional(),
  showTestimonials: z.boolean().optional(),
})

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const parsed = settingsSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid settings' },
        { status: 400 }
      )
    }
    const data = parsed.data

    const existing = await prisma.settings.findFirst({ select: { id: true } })
    const settings = existing
      ? await prisma.settings.update({ where: { id: existing.id }, data })
      : await prisma.settings.create({ data })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        entityId: settings.id,
        newValues: data
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
