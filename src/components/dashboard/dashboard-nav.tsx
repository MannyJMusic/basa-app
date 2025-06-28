"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  HomeIcon, 
  UserIcon, 
  CalendarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  CogIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon, requiresMember: true },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon, requiresMember: false },
  { name: "Events", href: "/dashboard/events", icon: CalendarIcon, requiresMember: true },
  { name: "Directory", href: "/dashboard/directory", icon: UsersIcon, requiresMember: true },
  { name: "Resources", href: "/dashboard/resources", icon: DocumentTextIcon, requiresMember: false },
  { name: "Account", href: "/dashboard/account", icon: CogIcon, requiresMember: false },
  { name: "Membership", href: "/dashboard/membership", icon: BuildingOfficeIcon, requiresMember: true },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Debug logging
  console.log("DashboardNav - Session data:", session?.user)
  console.log("DashboardNav - User role:", session?.user?.role)
  console.log("DashboardNav - Account status:", session?.user?.accountStatus)
  console.log("DashboardNav - Session status:", status)

  // Determine what navigation items to show based on user status
  const getVisibleNavigation = () => {
    // If session is loading, show all items temporarily
    if (status === "loading") {
      console.log("DashboardNav - Session loading, showing all navigation")
      return navigation
    }

    if (!session?.user) return []

    // If user is pending verification, only show Profile and Account
    if (session.user.accountStatus === "PENDING_VERIFICATION") {
      console.log("DashboardNav - User is pending verification, showing limited navigation")
      return navigation.filter(item => !item.requiresMember)
    }

    // If user is a guest, show Profile, Account, Resources, Events, and Directory
    if (session.user.role === "GUEST") {
      console.log("DashboardNav - User is guest, showing limited navigation")
      return navigation.filter(item => !item.requiresMember || item.name === "Events" || item.name === "Directory")
    }

    // For active members, show all navigation items
    console.log("DashboardNav - User is active member, showing all navigation")
    return navigation
  }

  const visibleNavigation = getVisibleNavigation()
  console.log("DashboardNav - Visible navigation items:", visibleNavigation.map(item => item.name))

  // Show loading state if session is loading
  if (status === "loading") {
    return (
      <nav className="flex-1 px-4 pb-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
        </div>
      </nav>
    )
  }

  const NavItems = () => (
    <ul className="space-y-2">
      {visibleNavigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile menu */}
      <div className={cn(
        "lg:hidden fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Menu
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <nav className="px-4 pb-4">
          <NavItems />
        </nav>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden lg:block flex-1 px-4 pb-4">
        <NavItems />
      </nav>
    </>
  )
} 