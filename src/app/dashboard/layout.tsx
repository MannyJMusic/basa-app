import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            BASA Dashboard
          </h1>
        </div>
        <DashboardNav />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 