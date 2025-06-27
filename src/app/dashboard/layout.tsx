import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
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

  // If user is pending verification, show banner and restrict content
  if (session.user.accountStatus === "PENDING_VERIFICATION") {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background">
        <aside className="hidden w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:block">
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
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={{
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.firstName || '',
            lastName: session.user.lastName || '',
            role: session.user.role || '',
            isActive: session.user.isActive || false,
            image: session.user.image || undefined
          }} />
          <main className="flex-1 p-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
              <strong>Email Verification Required:</strong> Please check your email and click the verification link to activate your account. You cannot access member content until your account is verified.
            </div>
            {/* Optionally allow editing profile/settings here */}
          </main>
        </div>
      </div>
    )
  }

  // If user is a guest, show guest/lead experience
  if (session.user.role === "GUEST") {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background">
        <aside className="hidden w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:block">
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
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={{
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.firstName || '',
            lastName: session.user.lastName || '',
            role: session.user.role || '',
            isActive: session.user.isActive || false,
            image: session.user.image || undefined
          }} />
          <main className="flex-1 p-6">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
              <strong>Welcome!</strong> You have limited access. Complete your profile and explore our free resources. To unlock full member benefits, <a href="/membership/join" className="underline font-semibold">join as a member</a>.
            </div>
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:block">
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
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={{
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.firstName || '',
          lastName: session.user.lastName || '',
          role: session.user.role || '',
          isActive: session.user.isActive || false,
          image: session.user.image || undefined
        }} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 