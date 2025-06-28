import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from "bcryptjs"
import { ROLE_PERMISSIONS, type UserRole, type Permission } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Role-based access control utilities
export function hasPermission(userRole: UserRole, action: string, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]
  
  // Check for specific permission
  const hasSpecificPermission = permissions.some(
    permission => permission.action === action && permission.resource === resource
  )
  
  // Check for wildcard permission
  const hasWildcardPermission = permissions.some(
    permission => permission.action === action && permission.resource === "all"
  )
  
  return hasSpecificPermission || hasWildcardPermission
}

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    GUEST: 0,
    MEMBER: 1,
    MODERATOR: 2,
    ADMIN: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function requireRole(requiredRole: UserRole) {
  return function (userRole: UserRole): boolean {
    return canAccess(userRole, requiredRole)
  }
}

// Session utilities
export function isAuthenticated(session: any): boolean {
  return !!session?.user?.id
}

export function isActiveUser(session: any): boolean {
  return isAuthenticated(session) && session.user.isActive
}

export function isMember(session: any): boolean {
  return isActiveUser(session) && session.user.role === "MEMBER"
}

export function isAdmin(session: any): boolean {
  return isActiveUser(session) && session.user.role === "ADMIN"
}

export function isModerator(session: any): boolean {
  return isActiveUser(session) && session.user.role === "MODERATOR"
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function generatePasswordResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Format utilities
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

export function formatRole(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

// Date utilities
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

// Redirect utilities
export function getRedirectUrl(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "MODERATOR":
      return "/admin"
    case "MEMBER":
      return "/dashboard"
    case "GUEST":
      return "/dashboard"
    default:
      return "/dashboard"
  }
}

// Generate a random verification token
export function generateVerificationToken(length = 48) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
} 