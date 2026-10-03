import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsletterForm } from "@/components/marketing/newsletter-form"

export const metadata: Metadata = {
  title: "Newsletter | BASA - Business Association of San Antonio",
  description: "Subscribe to the Business Association of San Antonio newsletter for upcoming events and news.",
}

export default function NewsletterSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-2">Subscribe to Our Newsletter</CardTitle>
              <CardDescription>
                Hear about upcoming BASA events and news from the Business Association of San Antonio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewsletterForm source="newsletter-page" />
              <p className="mt-6 text-sm text-gray-600">
                We use your name and email only to send the newsletter. See our{" "}
                <Link href="/privacy" className="underline">privacy policy</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
