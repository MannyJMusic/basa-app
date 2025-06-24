"use client"

import { usePathname } from "next/navigation"
import Navigation from "@/components/layout/navigation"
import Footer from "@/components/layout/footer"

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  // Don't render public navigation and footer for dashboard pages
  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
} 