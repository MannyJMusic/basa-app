import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Networking & Giving | BASA - Business Association of San Antonio",
  description: "How the Business Association of San Antonio brings business networking and community together.",
}

export default function NetworkingGivingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Networking &amp; Giving
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Networking with Purpose
            </h1>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Traditional business networking often focuses solely on lead generation and
              business development. While these are important goals, we believe that the
              most successful business relationships are built on shared values and a
              commitment to making a positive impact in our community.
            </p>
            <p>
              BASA brings San Antonio businesses together through networking events, and
              we believe that supporting local nonprofits and community organizations
              alongside one another builds stronger, more meaningful relationships.
            </p>
            <p>
              To find out what&apos;s coming up, see our events or get in touch with the office.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="basa-btn-primary">
                <Link href="/events" className="flex items-center">
                  Upcoming Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
