'use client'

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

export interface Member {
  id: string
  userId: string
  businessName?: string
  businessType?: string
  industry: string[]
  ein?: string
  yearEstablished?: number
  numberOfEmployees?: string
  annualRevenue?: string
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
  renewalDate?: string
  stripeCustomerId?: string
  subscriptionId?: string
  logo?: string
  coverImage?: string
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
  user: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
    role: string
    isActive: boolean
    lastLogin?: string
    createdAt: string
  }
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

export interface CreateMemberData {
  firstName: string
  lastName: string
  email: string
  password: string
  businessName?: string
  businessType?: string
  industry?: string[]
  businessEmail?: string
  businessPhone?: string
  businessAddress?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  membershipTier?: "BASIC" | "PREMIUM" | "VIP"
  role?: "MEMBER" | "MODERATOR" | "ADMIN"
}

export interface UpdateMemberData {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  businessName?: string
  businessType?: string
  industry?: string[]
  businessEmail?: string
  businessPhone?: string
  businessAddress?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  membershipTier?: "BASIC" | "PREMIUM" | "VIP"
  membershipStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  role?: "MEMBER" | "MODERATOR" | "ADMIN"
  isActive?: boolean
}

export interface MemberFilters {
  search?: string
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  membershipTier?: "BASIC" | "PREMIUM" | "VIP"
  industry?: string
  city?: string
  showInDirectory?: boolean
  page?: number
  limit?: number
  sortBy?: "firstName" | "lastName" | "businessName" | "joinedAt" | "membershipTier"
  sortOrder?: "asc" | "desc"
}

export interface MemberListResponse {
  members: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface BulkUploadResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{ row: number; email: string; error: string }>
  createdMembers: Array<{ email: string; businessName?: string }>
  updatedMembers: Array<{ email: string; businessName?: string }>
}

export function useMembers() {
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [pagination, setPagination] = useState<MemberListResponse['pagination'] | null>(null)
  const [currentMember, setCurrentMember] = useState<Member | null>(null)

  const fetchMembers = useCallback(async (
    filters: MemberFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'joinedAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...filters,
      })

      const url = `/api/members?${params}`
      console.log('useMembers: fetching members from', url)
      
      const response = await fetch(url)
      console.log('useMembers: response status', response.status, response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('useMembers: response not ok', errorText)
        throw new Error('Failed to fetch members')
      }

      const data: MemberListResponse = await response.json()
      console.log('useMembers: received data', data)
      console.log('useMembers: members count', data.members?.length)
      
      setMembers(data.members)
      setPagination(data.pagination)
      return data
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMember = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/members/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch member')
      }

      const member: Member = await response.json()
      setCurrentMember(member)
      return member
    } catch (error) {
      console.error('Error fetching member:', error)
      toast({
        title: "Error",
        description: "Failed to fetch member",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createMember = useCallback(async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create member')
      }

      const member: Member = await response.json()
      toast({
        title: "Success",
        description: "Member created successfully",
      })
      return member
    } catch (error) {
      console.error('Error creating member:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create member",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMember = useCallback(async (id: string, data: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update member')
      }

      const member: Member = await response.json()
      
      // Update the current member if it's the one being updated
      if (currentMember?.id === id) {
        setCurrentMember(member)
      }

      // Update the member in the list
      setMembers(prev => prev.map(m => m.id === id ? member : m))

      toast({
        title: "Success",
        description: "Member updated successfully",
      })
      return member
    } catch (error) {
      console.error('Error updating member:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update member",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentMember])

  const deleteMember = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete member')
      }

      // Remove from members list
      setMembers(prev => prev.filter(m => m.id !== id))
      
      // Clear current member if it's the one being deleted
      if (currentMember?.id === id) {
        setCurrentMember(null)
      }

      toast({
        title: "Success",
        description: "Member deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting member:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete member",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentMember])

  const exportMembers = useCallback(async (
    filters: MemberFilters = {},
    format: 'csv' | 'json' = 'csv'
  ) => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters,
      })

      const response = await fetch(`/api/members/export?${params}`)
      if (!response.ok) {
        throw new Error('Failed to export members')
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `basa-members-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        return data
      }

      toast({
        title: "Success",
        description: `Members exported successfully as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error exporting members:', error)
      toast({
        title: "Error",
        description: "Failed to export members",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const bulkUploadMembers = useCallback(async (file: File): Promise<BulkUploadResult | null> => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/members/bulk-upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload members")
      }

      const result = await response.json()
      return result.results
    } catch (error) {
      console.error('Error uploading members:', error)
      toast({
        title: "Error",
        description: "Failed to upload members",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    members,
    pagination,
    currentMember,
    fetchMembers,
    fetchMember,
    createMember,
    updateMember,
    deleteMember,
    exportMembers,
    bulkUploadMembers,
  }
} 