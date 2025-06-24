import { DefaultSession } from "next-auth"
import { Role, Status, MembershipTier } from "@prisma/client"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      isActive: boolean
      member?: {
        id: string
        businessName: string
        membershipTier: MembershipTier
        membershipStatus: Status
      } | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: Role
    isActive: boolean
    member?: {
      id: string
      businessName: string
      membershipTier: MembershipTier
      membershipStatus: Status
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    isActive: boolean
    member?: {
      id: string
      businessName: string
      membershipTier: MembershipTier
      membershipStatus: Status
    } | null
  }
}

// Role-based access control types
export type UserRole = Role
export type UserStatus = Status
export type UserMembershipTier = MembershipTier

// Permission types
export interface Permission {
  action: string
  resource: string
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    { action: "read", resource: "all" },
    { action: "write", resource: "all" },
    { action: "delete", resource: "all" },
    { action: "manage", resource: "users" },
    { action: "manage", resource: "events" },
    { action: "manage", resource: "payments" },
    { action: "manage", resource: "content" },
    { action: "view", resource: "analytics" },
  ],
  MODERATOR: [
    { action: "read", resource: "all" },
    { action: "write", resource: "events" },
    { action: "write", resource: "content" },
    { action: "moderate", resource: "users" },
    { action: "view", resource: "analytics" },
  ],
  MEMBER: [
    { action: "read", resource: "member-content" },
    { action: "write", resource: "own-profile" },
    { action: "read", resource: "member-directory" },
    { action: "write", resource: "own-events" },
    { action: "read", resource: "resources" },
  ],
  GUEST: [
    { action: "read", resource: "public-content" },
    { action: "write", resource: "own-profile" },
  ],
}

// Auth utility types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  member?: {
    id: string
    businessName: string
    membershipTier: UserMembershipTier
    membershipStatus: UserStatus
  } | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface PasswordResetData {
  email: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
} 