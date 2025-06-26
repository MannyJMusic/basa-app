"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { UserRole, canAccess, Role } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole
  fallback?: ReactNode
  redirectTo?: string
}

function isValidRole(role: string): role is UserRole {
  return Object.values(Role).includes(role as Role);
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback = null,
  redirectTo 
}: RoleGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/sign-in")
      return
    }

    if (!session.user.isActive) {
      router.push("/auth/account-suspended")
      return
    }

    const userRole = session.user.role;
    if (!isValidRole(userRole) || !canAccess(userRole as UserRole, requiredRole)) {
      if (redirectTo) {
        router.push(redirectTo)
      }
    }
  }, [session, status, requiredRole, redirectTo, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return fallback
  }

  if (!session.user.isActive) {
    return fallback
  }

  const userRole = session.user.role;
  if (!isValidRole(userRole) || !canAccess(userRole as UserRole, requiredRole)) {
    return fallback
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole={Role.ADMIN} fallback={fallback}>{children}</RoleGuard>
}

export function ModeratorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole={Role.MODERATOR} fallback={fallback}>{children}</RoleGuard>
}

export function MemberOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole={Role.MEMBER} fallback={fallback}>{children}</RoleGuard>
}

export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole={Role.GUEST} fallback={fallback}>{children}</RoleGuard>
} 