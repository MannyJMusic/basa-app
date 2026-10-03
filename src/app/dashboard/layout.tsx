import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Pages still render; the banner explains what is limited. Member-only data
  // is enforced by the API routes, not by hiding pages here.
  let banner: React.ReactNode = null
  if (session.user.accountStatus === "PENDING_VERIFICATION") {
    banner = (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-6">
        <strong>Email verification required:</strong> please check your email and click the verification link to activate your account.
      </div>
    )
  } else if (session.user.role === "GUEST") {
    banner = (
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded mb-6">
        <strong>Your membership isn&apos;t active.</strong>{" "}
        <Link href="/membership" className="underline font-semibold">View membership levels</Link>
        {" "}or contact the office to join or renew.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:block shrink-0">
        <div className="p-6">
          <div className="flex items-center">
            <Image
              src="/images/BASA-LOGO.png"
              alt="BASA Logo"
              width={100}
              height={35}
              className="h-8 w-auto"
            />
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Dashboard
            </span>
          </div>
        </div>
        <DashboardNav />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader user={{
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.firstName || '',
          lastName: session.user.lastName || '',
          role: session.user.role || '',
          isActive: session.user.isActive || false,
          image: session.user.image || undefined
        }} />
        <main className="flex-1 p-4 sm:p-6">
          {banner}
          {children}
        </main>
      </div>
    </div>
  )
}
