"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { NavDrawer } from "@/components/layout/nav-drawer"
import { 
  HomeIcon, 
  UserIcon, 
  CalendarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  CogIcon,
  BuildingOfficeIcon,
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

/** `mobile` renders the phone menu button and drawer; otherwise the sidebar list. */
export default function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Determine what navigation items to show based on user status
  const getVisibleNavigation = () => {
    // If session is loading, show all items temporarily
    if (status === "loading") {
      return navigation
    }

    if (!session?.user) return []

    // If user is pending verification, only show Profile and Account
    if (session.user.accountStatus === "PENDING_VERIFICATION") {
      return navigation.filter(item => !item.requiresMember)
    }

    // A guest has no active membership: no directory (the API refuses it), but
    // their own tickets and events are still theirs.
    if (session.user.role === "GUEST") {
      return navigation.filter(item => !item.requiresMember || item.name === "Overview" || item.name === "Events")
    }

    // For active members, show all navigation items
    return navigation
  }

  const visibleNavigation = getVisibleNavigation()

  // Show loading state if session is loading
  if (status === "loading" && !mobile) {
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
        const isActive = item.href === "/dashboard"
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(item.href + "/")
        return (
          <li key={item.name}>
            <Link
              href={item.href}
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

  if (mobile) {
    return (
      <NavDrawer title="Menu" triggerClassName="lg:hidden">
        <nav className="p-4">
          <NavItems />
        </nav>
      </NavDrawer>
    )
  }

  return (
    <nav className="flex-1 px-4 pb-4">
      <NavItems />
    </nav>
  )
}
