import { useState, useCallback } from "react"

export interface Member {
  id: string
  userId: string
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
  page?: number
  limit?: number
  sortBy?: "firstName" | "lastName" | "businessName" | "joinedAt" | "membershipTier"
  sortOrder?: "asc" | "desc"
}

export interface MembersResponse {
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async (filters: MemberFilters = {}): Promise<MembersResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`/api/members?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch members")
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch members"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMember = useCallback(async (id: string): Promise<Member | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/members/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch member")
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch member"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createMember = useCallback(async (data: CreateMemberData): Promise<Member | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create member")
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create member"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateMember = useCallback(async (id: string, data: UpdateMemberData): Promise<Member | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update member")
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update member"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete member")
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete member"
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const exportMembers = useCallback(async (filters: MemberFilters = {}, format: "csv" | "json" = "csv"): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value))
        }
      })
      
      params.append("format", format)

      const response = await fetch(`/api/members/export?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to export members")
      }

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `basa-members-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `basa-members-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to export members"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const bulkUploadMembers = useCallback(async (file: File): Promise<BulkUploadResult | null> => {
    setIsLoading(true)
    setError(null)

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload members"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    fetchMembers,
    fetchMember,
    createMember,
    updateMember,
    deleteMember,
    exportMembers,
    bulkUploadMembers,
  }
} 