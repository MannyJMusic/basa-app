"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Settings {
  id: string
  organizationName: string
  contactEmail: string
  phoneNumber?: string
  website: string
  address?: string
  description?: string
  maintenanceMode: boolean
  autoApproveMembers: boolean
  emailNotifications: boolean
  requireTwoFactor: boolean
  sessionTimeout: number
  enforcePasswordPolicy: boolean
  allowedIpAddresses?: string
  apiRateLimit: number
  notifyNewMembers: boolean
  notifyPayments: boolean
  notifyEventRegistrations: boolean
  notifySystemAlerts: boolean
  adminEmails?: string
  stripePublicKey?: string
  stripeSecretKey?: string
  stripeTestMode: boolean
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  googleAnalyticsId?: string
  googleTagManagerId?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  showMemberCount: boolean
  showEventCalendar: boolean
  showTestimonials: boolean
  createdAt: string
  updatedAt: string
}

export function useSettings() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Update settings
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
      
      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Reset settings to defaults
  const resetSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const defaultSettings = {
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
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultSettings),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset settings')
      }
      
      const resetSettings = await response.json()
      setSettings(resetSettings)
      return resetSettings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Fetch settings on mount
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchSettings()
    } else {
      setLoading(false)
    }
  }, [session])

  return {
    settings,
    loading,
    error,
    saving,
    fetchSettings,
    updateSettings,
    resetSettings,
  }
} 