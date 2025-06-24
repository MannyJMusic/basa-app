import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { auth } from "@/lib/auth"
import Navigation from "@/components/layout/navigation"
import Footer from "@/components/layout/footer"
import * as Sentry from '@sentry/nextjs';

const inter = Inter({ subsets: ["latin"] })

export function generateMetadata(): Metadata {
  return {
    title: "BASA - Business Association of San Antonio",
    description: "Building stronger business communities through networking and giving.",
    other: {
      ...Sentry.getTraceData()
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
} 