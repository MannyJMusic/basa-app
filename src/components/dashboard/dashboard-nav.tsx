"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  HomeIcon, 
  UserIcon, 
  CalendarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  CogIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "Events", href: "/dashboard/events", icon: CalendarIcon },
  { name: "Directory", href: "/dashboard/directory", icon: UsersIcon },
  { name: "Resources", href: "/dashboard/resources", icon: DocumentTextIcon },
  { name: "Account", href: "/dashboard/account", icon: CogIcon },
  { name: "Membership", href: "/dashboard/membership", icon: BuildingOfficeIcon },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 pb-4">
      <ul className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
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
    </nav>
  )
} 