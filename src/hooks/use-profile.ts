"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import type { MembershipTier, Status } from "@prisma/client"

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
    membershipTier?: MembershipTier
    membershipStatus: Status
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

/** Optional text fields take null to clear them. */
export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  email?: string
  businessName?: string | null
  businessType?: string | null
  industry?: string[]
  businessEmail?: string | null
  businessPhone?: string | null
  businessAddress?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  website?: string | null
  description?: string | null
  tagline?: string | null
  specialties?: string[]
  certifications?: string[]
  linkedin?: string | null
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  youtube?: string | null
  showInDirectory?: boolean
  allowContact?: boolean
  showAddress?: boolean
}

export function useProfile() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  /** Loading the profile failed: the page has nothing to show. */
  const [error, setError] = useState<string | null>(null)
  /** Saving failed: shown next to the form, which keeps the user's edits. */
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/profile")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
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
  }, [userId])

  // Update profile data
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<{ emailChangePending?: string | null } | null> => {
    if (!userId) {
      setSaveError("Not signed in")
      return null
    }

    try {
      setSaving(true)
      setSaveError(null)
      setFieldErrors({})

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setFieldErrors(errorData.fieldErrors ?? {})
        setSaveError(errorData.error || "Failed to update profile")
        return null
      }

      const result = await response.json()

      setProfile(prev => prev ? {
        ...prev,
        ...(result.user ? {
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        } : {}),
        member: result.member ? {
          ...prev.member,
          ...result.member,
        } : prev.member,
      } : prev)

      return result
    } catch {
      setSaveError("Could not reach the server. Your changes have not been saved.")
      return null
    } finally {
      setSaving(false)
    }
  }, [userId])

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

  // Fetch once per signed-in user (not on every session refresh, which
  // would overwrite edits in progress).
  useEffect(() => {
    if (status === "loading") return
    fetchProfile()
  }, [fetchProfile, status])

  return {
    profile,
    loading,
    error,
    saveError,
    fieldErrors,
    saving,
    fetchProfile,
    updateProfile,
    getProfileCompletion,
    getProfileCompletionDetails,
  }
} 