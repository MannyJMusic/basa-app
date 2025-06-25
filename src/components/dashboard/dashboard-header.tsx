"use client"

import { signOut } from "next-auth/react"
import { UserCircleIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    image?: string
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  // Generate initials for avatar fallback
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {user.firstName}!
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.image} 
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {user.image ? (
                  <UserCircleIcon className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{initials}</span>
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user.firstName} {user.lastName}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
} 