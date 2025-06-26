import { db } from '@/lib/db'

export async function getSettings() {
  try {
    let settings = await db.settings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await db.settings.create({
        data: {
          organizationName: 'BASA - Business Association of San Antonio',
          contactEmail: 'admin@basa.org',
          website: 'https://basa.org',
          maintenanceMode: false,
          autoApproveMembers: false,
          emailNotifications: true,
          requireTwoFactor: true,
          sessionTimeout: 30,
          enforcePasswordPolicy: true,
          apiRateLimit: 100,
          notifyNewMembers: true,
          notifyPayments: true,
          notifyEventRegistrations: true,
          notifySystemAlerts: true,
          stripeTestMode: true,
          primaryColor: '#1e40af',
          secondaryColor: '#059669',
          showMemberCount: true,
          showEventCalendar: true,
          showTestimonials: true,
        }
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return default settings if database is unavailable
    return {
      id: 'default',
      organizationName: 'BASA - Business Association of San Antonio',
      contactEmail: 'admin@basa.org',
      website: 'https://basa.org',
      maintenanceMode: false,
      autoApproveMembers: false,
      emailNotifications: true,
      requireTwoFactor: true,
      sessionTimeout: 30,
      enforcePasswordPolicy: true,
      apiRateLimit: 100,
      notifyNewMembers: true,
      notifyPayments: true,
      notifyEventRegistrations: true,
      notifySystemAlerts: true,
      stripeTestMode: true,
      primaryColor: '#1e40af',
      secondaryColor: '#059669',
      showMemberCount: true,
      showEventCalendar: true,
      showTestimonials: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
}

export async function isMaintenanceMode() {
  const settings = await getSettings()
  return settings?.maintenanceMode || false
}

export async function shouldAutoApproveMembers() {
  const settings = await getSettings()
  return settings?.autoApproveMembers || false
}

export async function getAdminEmails() {
  const settings = await getSettings()
  if (!(settings as any)?.adminEmails) return []
  return (settings as any).adminEmails
    .split('\n')
    .map((email: string) => email.trim())
    .filter((email: string) => email.length > 0)
}

export async function shouldNotifyNewMembers() {
  const settings = await getSettings()
  return settings?.notifyNewMembers || false
}

export async function shouldNotifyPayments() {
  const settings = await getSettings()
  return settings?.notifyPayments || false
}

export async function shouldNotifyEventRegistrations() {
  const settings = await getSettings()
  return settings?.notifyEventRegistrations || false
}

export async function shouldNotifySystemAlerts() {
  const settings = await getSettings()
  return settings?.notifySystemAlerts || false
}

export async function getStripeConfig() {
  const settings = await getSettings()
  return {
    publicKey: (settings as any)?.stripePublicKey,
    secretKey: (settings as any)?.stripeSecretKey,
    testMode: settings?.stripeTestMode || true,
  }
}

export async function getSmtpConfig() {
  const settings = await getSettings()
  return {
    host: (settings as any)?.smtpHost,
    port: (settings as any)?.smtpPort,
    username: (settings as any)?.smtpUsername,
    password: (settings as any)?.smtpPassword,
  }
}

export async function getAppearanceSettings() {
  const settings = await getSettings()
  return {
    logoUrl: (settings as any)?.logoUrl,
    faviconUrl: (settings as any)?.faviconUrl,
    primaryColor: settings?.primaryColor || '#1e40af',
    secondaryColor: settings?.secondaryColor || '#059669',
    showMemberCount: settings?.showMemberCount || true,
    showEventCalendar: settings?.showEventCalendar || true,
    showTestimonials: settings?.showTestimonials || true,
  }
} 