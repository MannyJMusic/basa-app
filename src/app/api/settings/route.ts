import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/settings - Retrieve all settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the first (and only) settings record, or create default if none exists
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Create default settings
      settings = await prisma.settings.create({
        data: {}
      })
    }

    // Don't return sensitive data like API keys
    const safeSettings = {
      ...settings,
      stripeSecretKey: undefined,
      smtpPassword: undefined
    }

    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.organizationName || !body.contactEmail) {
      return NextResponse.json(
        { error: 'Organization name and contact email are required' },
        { status: 400 }
      )
    }

    // Get existing settings or create new ones
    let settings = await prisma.settings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          // Organization Information
          organizationName: body.organizationName,
          contactEmail: body.contactEmail,
          phoneNumber: body.phoneNumber,
          website: body.website,
          address: body.address,
          description: body.description,
          
          // System Settings
          maintenanceMode: body.maintenanceMode,
          autoApproveMembers: body.autoApproveMembers,
          emailNotifications: body.emailNotifications,
          
          // Security Settings
          requireTwoFactor: body.requireTwoFactor,
          sessionTimeout: body.sessionTimeout,
          enforcePasswordPolicy: body.enforcePasswordPolicy,
          allowedIpAddresses: body.allowedIpAddresses,
          apiRateLimit: body.apiRateLimit,
          
          // Notification Settings
          notifyNewMembers: body.notifyNewMembers,
          notifyPayments: body.notifyPayments,
          notifyEventRegistrations: body.notifyEventRegistrations,
          notifySystemAlerts: body.notifySystemAlerts,
          adminEmails: body.adminEmails,
          
          // Integration Settings
          stripePublicKey: body.stripePublicKey,
          stripeSecretKey: body.stripeSecretKey,
          stripeTestMode: body.stripeTestMode,
          smtpHost: body.smtpHost,
          smtpPort: body.smtpPort,
          smtpUsername: body.smtpUsername,
          smtpPassword: body.smtpPassword,
          googleAnalyticsId: body.googleAnalyticsId,
          googleTagManagerId: body.googleTagManagerId,
          
          // Appearance Settings
          logoUrl: body.logoUrl,
          faviconUrl: body.faviconUrl,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          showMemberCount: body.showMemberCount,
          showEventCalendar: body.showEventCalendar,
          showTestimonials: body.showTestimonials,
        }
      })
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: body
      })
    }

    // Log the settings update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        entityId: settings.id,
        newValues: body
      }
    })

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      stripeSecretKey: undefined,
      smtpPassword: undefined
    }

    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 