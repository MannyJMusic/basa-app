"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface AdminUser {
  id: string
  name: string | null
  email: string | null
  role: string
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
  firstName: string | null
  lastName: string | null
}

export interface CreateAdminUserData {
  email: string
  password: string
  name?: string
  firstName?: string
  lastName?: string
  role: string
}

export interface UpdateAdminUserData {
  name?: string
  firstName?: string
  lastName?: string
  role?: string
  isActive?: boolean
  password?: string
}

export function useAdminUsers() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch admin users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch admin users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Create new admin user
  const createUser = async (userData: CreateAdminUserData) => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create admin user')
      }
      
      const newUser = await response.json()
      setUsers(prev => [newUser, ...prev])
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Update admin user
  const updateUser = async (userId: string, userData: UpdateAdminUserData) => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update admin user')
      }
      
      const updatedUser = await response.json()
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ))
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Delete admin user
  const deleteUser = async (userId: string) => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete admin user')
      }
      
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Get user by ID
  const getUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  // Fetch users on mount
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [session])

  return {
    users,
    loading,
    error,
    saving,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
  }
} 