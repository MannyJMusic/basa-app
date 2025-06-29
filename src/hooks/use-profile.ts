"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

export interface ProfileData {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  member?: {
    id: string
    businessName?: string
    businessType?: string
    industry: string[]
    businessEmail?: string
    businessPhone?: string
    businessAddress?: string
    city?: string
    state?: string
    zipCode?: string
    website?: string
    membershipTier?: "BASIC" | "PREMIUM" | "VIP"
    membershipStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED"
    joinedAt: string
    description?: string
    tagline?: string
    specialties: string[]
    certifications: string[]
    linkedin?: string
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    showInDirectory: boolean
    allowContact: boolean
    showAddress: boolean
    eventRegistrations: Array<{
      id: string
      event: {
        id: string
        title: string
        startDate: string
        status: string
      }
    }>
    referralsGiven: Array<{
      id: string
      referred: {
        id: string
        businessName?: string
        user: {
          firstName?: string
          lastName?: string
        }
      }
    }>
    referralsReceived: Array<{
      id: string
      referrer: {
        id: string
        businessName?: string
        user: {
          firstName?: string
          lastName?: string
        }
      }
    }>
  }
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  email?: string
  businessName?: string
  businessType?: string
  industry?: string[]
  businessEmail?: string
  businessPhone?: string
  personalPhone?: string
  businessAddress?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  description?: string
  tagline?: string
  specialties?: string[]
  certifications?: string[]
  linkedin?: string
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  showInDirectory?: boolean
  allowContact?: boolean
  showAddress?: boolean
}

export function useProfile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/profile")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Update profile data
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<ProfileData | null> => {
    if (!session?.user) {
      setError("Not authenticated")
      return null
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const result = await response.json()
      
      // Update local state with new data
      if (profile) {
        setProfile({
          ...profile,
          ...result.user,
          member: result.member ? {
            ...profile.member,
            ...result.member,
          } : profile.member,
        })
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      setError(errorMessage)
      return null
    } finally {
      setSaving(false)
    }
  }, [session?.user, profile])

  // Calculate profile completion percentage
  const getProfileCompletion = useCallback(() => {
    if (!profile) return 0

    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.member?.businessName,
      profile.member?.businessType,
      profile.member?.businessEmail,
      profile.member?.businessPhone,
      profile.member?.description,
      profile.member?.specialties?.length,
      profile.member?.certifications?.length,
    ]

    const completedFields = fields.filter(field => 
      field && (typeof field === 'string' ? field.trim() !== '' : field > 0)
    ).length

    return Math.round((completedFields / fields.length) * 100)
  }, [profile])

  // Get detailed profile completion status for each section
  const getProfileCompletionDetails = useCallback(() => {
    if (!profile) {
      return {
        basicInfo: false,
        contactInfo: false,
        servicesExpertise: false,
        businessDetails: false,
        socialMedia: false,
        overall: 0
      }
    }

    // Basic Information (name, email, business name, business type)
    const basicInfoComplete = !!(
      profile.firstName?.trim() &&
      profile.lastName?.trim() &&
      profile.email?.trim() &&
      profile.member?.businessName?.trim() &&
      profile.member?.businessType?.trim()
    )

    // Contact Information (business email, phone, address, website)
    const contactInfoComplete = !!(
      profile.member?.businessEmail?.trim() &&
      profile.member?.businessPhone?.trim() &&
      profile.member?.businessAddress?.trim() &&
      profile.member?.website?.trim()
    )

    // Services & Expertise (description, specialties, certifications)
    const servicesExpertiseComplete = !!(
      profile.member?.description?.trim() &&
      profile.member?.specialties?.length > 0 &&
      profile.member?.certifications?.length > 0
    )

    // Business Details (industry, location details)
    const businessDetailsComplete = !!(
      profile.member?.industry && profile.member.industry.length > 0 &&
      profile.member?.city?.trim() &&
      profile.member?.state?.trim()
    )

    // Social Media (at least one social media link)
    const socialMediaComplete = !!(
      profile.member?.linkedin?.trim() ||
      profile.member?.facebook?.trim() ||
      profile.member?.instagram?.trim() ||
      profile.member?.twitter?.trim() ||
      profile.member?.youtube?.trim()
    )

    // Calculate overall completion percentage
    const sections = [basicInfoComplete, contactInfoComplete, servicesExpertiseComplete, businessDetailsComplete, socialMediaComplete]
    const completedSections = sections.filter(Boolean).length
    const overall = Math.round((completedSections / sections.length) * 100)

    return {
      basicInfo: basicInfoComplete,
      contactInfo: contactInfoComplete,
      servicesExpertise: servicesExpertiseComplete,
      businessDetails: businessDetailsComplete,
      socialMedia: socialMediaComplete,
      overall
    }
  }, [profile])

  // Get networking stats
  const getNetworkingStats = useCallback(() => {
    if (!profile?.member) {
      return {
        connections: 0,
        meetings: 0,
        eventsAttended: 0,
        referralsGiven: 0,
      }
    }

    return {
      connections: profile.member.referralsGiven.length + profile.member.referralsReceived.length,
      meetings: profile.member.eventRegistrations.length,
      eventsAttended: profile.member.eventRegistrations.filter(reg => reg.event.status === 'COMPLETED').length,
      referralsGiven: profile.member.referralsGiven.length,
    }
  }, [profile])

  // Fetch profile on mount and when session changes
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    saving,
    fetchProfile,
    updateProfile,
    getProfileCompletion,
    getProfileCompletionDetails,
    getNetworkingStats,
  }
} 