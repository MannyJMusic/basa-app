"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { UserRole, canAccess } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole
  fallback?: ReactNode
  redirectTo?: string
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

    if (!canAccess(session.user.role, requiredRole)) {
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

  if (!canAccess(session.user.role, requiredRole)) {
    return fallback
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="ADMIN" fallback={fallback}>{children}</RoleGuard>
}

export function ModeratorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="MODERATOR" fallback={fallback}>{children}</RoleGuard>
}

export function MemberOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="MEMBER" fallback={fallback}>{children}</RoleGuard>
}

export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="GUEST" fallback={fallback}>{children}</RoleGuard>
} 