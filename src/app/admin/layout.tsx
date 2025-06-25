"use client"

import { AdminOnly } from "@/components/auth/role-guard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, BarChart2, Users, FileText, Calendar, DollarSign, UserPlus, Settings } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { UserCircleIcon } from "@heroicons/react/24/outline"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <AdminOnly fallback={<div className="p-8 text-center text-red-600">Access denied. Admins only.</div>}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col">
          <div className="h-16 flex items-center justify-center border-b">
            <span className="font-bold text-xl tracking-tight text-blue-900">BASA Admin</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <BarChart2 className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <BarChart2 className="w-5 h-5" /> Analytics
            </Link>
            <Link href="/admin/members" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <Users className="w-5 h-5" /> Members
            </Link>
            <Link href="/admin/events" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <Calendar className="w-5 h-5" /> Events
            </Link>
            <Link href="/admin/leads" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <UserPlus className="w-5 h-5" /> Leads
            </Link>
            <Link href="/admin/payments" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <DollarSign className="w-5 h-5" /> Payments
            </Link>
            <Link href="/admin/content" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <FileText className="w-5 h-5" /> Content
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-blue-900 font-medium">
              <Settings className="w-5 h-5" /> Settings
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2" 
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
            <div className="font-semibold text-lg text-blue-900">Admin Panel</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
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
          </header>
          <div className="flex-1 p-8 overflow-y-auto">{children}</div>
        </main>
      </div>
    </AdminOnly>
  )
} 