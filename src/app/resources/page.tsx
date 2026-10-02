import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Users } from "lucide-react"
import { NewsletterForm } from "@/components/marketing/newsletter-form"

export const metadata: Metadata = {
  title: "Resources | BASA - Business Association of San Antonio",
  description: "Newsletter, events and membership information from the Business Association of San Antonio.",
}

const nextSteps = [
  {
    icon: Calendar,
    title: "Upcoming Events",
    description: "See BASA networking events in San Antonio and register online.",
    href: "/events",
    cta: "Browse Events",
  },
  {
    icon: Users,
    title: "Membership",
    description: "Compare the BASA membership levels and what each one includes.",
    href: "/membership",
    cta: "View Membership Levels",
  },
  {
    icon: MessageSquare,
    title: "Questions",
    description: "Talk to the BASA office about events, membership or sponsorship.",
    href: "/contact",
    cta: "Contact Us",
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-linear-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resources</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Stay in touch with the Business Association of San Antonio.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {nextSteps.map((step) => {
              const Icon = step.icon
              return (
                <Card key={step.href} className="border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={step.href}>{step.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Subscribe to the Newsletter</h2>
            <p className="text-xl mb-8 text-blue-100">
              Hear about upcoming BASA events and news.
            </p>
            <NewsletterForm source="resources-page" tone="dark" className="text-left" />
          </div>
        </div>
      </section>
    </div>
  )
}
