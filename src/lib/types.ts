import { DefaultSession } from "next-auth"
import { Status, MembershipTier } from "@prisma/client"

// Define Role enum locally since it's not exported from Prisma
export enum Role {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR", 
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
      role: string
      isActive: boolean
      image?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    image?: string
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

// Role access control function
export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [Role.ADMIN]: 4,
    [Role.MODERATOR]: 3,
    [Role.MEMBER]: 2,
    [Role.GUEST]: 1,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  startDate: Date
  endDate: Date
  location: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  capacity?: number
  price?: number
  memberPrice?: number
  category: string
  type: 'NETWORKING' | 'SUMMIT' | 'RIBBON_CUTTING' | 'COMMUNITY'
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  isFeatured: boolean
  image?: string
  organizerId: string
  organizer: Member
  registrations: EventRegistration[]
  speakers: EventSpeaker[]
  sponsors: EventSponsor[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface EventRegistration {
  id: string
  eventId: string
  event: Event
  memberId?: string
  member?: Member
  name: string
  email: string
  company?: string
  phone?: string
  ticketCount: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
  paymentIntentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface EventSpeaker {
  id: string
  eventId: string
  event: Event
  name: string
  title?: string
  company?: string
  bio?: string
  image?: string
  topic?: string
  order: number
  createdAt: Date
}

export interface EventSponsor {
  id: string
  eventId: string
  event: Event
  memberId?: string
  member?: Member
  name: string
  logo?: string
  website?: string
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  createdAt: Date
}

export interface EventFilters {
  category?: string[]
  dateRange?: { start: Date | null; end: Date | null }
  location?: string[]
  priceRange?: { min: number; max: number }
  type?: string[]
  search?: string
}

export interface EventPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface EventsResponse {
  events: Event[]
  pagination: EventPagination
} 