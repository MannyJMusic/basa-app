"use client"

import { signOut } from "next-auth/react"
import { UserCircleIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
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
            <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
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