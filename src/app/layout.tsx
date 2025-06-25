import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { auth } from "@/lib/auth"
import PublicLayout from "@/components/layout/public-layout"
import { Toaster } from "@/components/ui/toaster"
import * as Sentry from '@sentry/nextjs';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export function generateMetadata(): Metadata {
  return {
    title: "BASA - Business Association of San Antonio | Premier Business Network",
    description: "Join 150+ thriving businesses in San Antonio's premier business network. Connect, collaborate, and grow with BASA's strategic networking events and community partnerships.",
    keywords: ["business network", "San Antonio", "networking", "business association", "BASA", "professional development", "business growth"],
    authors: [{ name: "BASA - Business Association of San Antonio" }],
    creator: "BASA",
    publisher: "BASA",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://basa.org'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: "BASA - Business Association of San Antonio",
      description: "Join 150+ thriving businesses in San Antonio's premier business network. Connect, collaborate, and grow with BASA's strategic networking events and community partnerships.",
      url: 'https://basa.org',
      siteName: 'BASA',
      images: [
        {
          url: '/images/BASA-LOGO.png',
          width: 1200,
          height: 630,
          alt: 'BASA - Business Association of San Antonio',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: "BASA - Business Association of San Antonio",
      description: "Join 150+ thriving businesses in San Antonio's premier business network.",
      images: ['/images/BASA-LOGO.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <PublicLayout>
            {children}
          </PublicLayout>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
} 