import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ROLE_PERMISSIONS, type UserRole, type Permission } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Imported by every UI component (for cn), so it must stay browser-safe: no
// Node-only packages here. Password hashing lives in @/lib/password.

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
  // These tokens activate accounts, so they come from the CSPRNG, not
  // Math.random (2026-09-22 audit, M-A6). Web Crypto exists in Node and browsers.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  let token = ''
  for (let i = 0; i < length; i++) {
    // 248 = 4 * 62: rejecting bytes at or above it keeps every character equally likely.
    let b = bytes[i]
    while (b >= 248) b = globalThis.crypto.getRandomValues(new Uint8Array(1))[0]
    token += chars.charAt(b % chars.length)
  }
  return token
} 

/**
 * A post-sign-in destination taken from ?callbackUrl=. Only a same-site path is
 * accepted ("/events/x/register"), never "//host" or "https://host", so the
 * parameter cannot be used to bounce someone off-site after they sign in.
 */
export function safeCallbackPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}
