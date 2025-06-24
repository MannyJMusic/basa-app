import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Users, TrendingUp, Award, Handshake, Building2, ArrowRight, Video, CheckCircle } from "lucide-react"

const VIDEO_TESTIMONIALS = [
  {
    id: "1",
    title: "How BASA Helped Me Grow My Business",
    member: "Sarah Johnson, CEO, Johnson Marketing Group",
    url: "https://www.youtube.com/embed/VIDEO_ID_1",
    description: "Sarah shares how BASA referrals generated $150,000+ in new business for her agency."
  },
  {
    id: "2",
    title: "From Startup to Success with BASA",
    member: "Jennifer Martinez, Founder, TechFlow Solutions",
    url: "https://www.youtube.com/embed/VIDEO_ID_2",
    description: "Jennifer explains how BASA connections helped her scale from 3 to 25 employees."
  },
  {
    id: "3",
    title: "Networking & Giving: Making an Impact",
    member: "Lisa Rodriguez, Principal, Rodriguez Legal Services",
    url: "https://www.youtube.com/embed/VIDEO_ID_3",
    description: "Lisa describes the impact of BASA's Networking and Giving initiative on her business and the community."
  }
]

const CASE_STUDIES = [
  {
    id: "a",
    title: "$500K Revenue Growth in 12 Months",
    member: "TechFlow Solutions",
    summary: "Leveraged BASA's member directory and events to connect with 15+ key clients and win the Rising Star Award.",
    highlights: [
      "Generated $500K+ in new revenue",
      "Secured 15+ key clients",
      "Won BASA Rising Star Award"
    ]
  },
  {
    id: "b",
    title: "40% Business Growth Through Networking",
    member: "Chen Development Group",
    summary: "Grew 40% in two years by attending BASA events and forming strategic partnerships.",
    highlights: [
      "40% business growth",
      "8 major development partnerships",
      "Expanded to 3 new markets"
    ]
  },
  {
    id: "c",
    title: "$250K Raised for Nonprofits",
    member: "BASA Networking & Giving Initiative",
    summary: "BASA members raised $250K+ for local nonprofits in 2023 through collaborative events.",
    highlights: [
      "Supported 15+ nonprofit organizations",
      "100+ member volunteers",
      "40% increase in community partnerships"
    ]
  }
]

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Member Success Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Real Results from San Antonio Business Leaders
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Watch video testimonials and read case studies from BASA members who have grown their businesses and made an impact.
            </p>
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Video Testimonials
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear directly from our members about the impact BASA has had on their businesses and careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {VIDEO_TESTIMONIALS.map((video) => (
              <Card key={video.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">{video.title}</CardTitle>
                  <CardDescription className="mb-2">{video.member}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe
                      src={video.url}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-56 rounded-lg border"
                    />
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{video.description}</p>
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/membership/join">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Join BASA Today
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Member Case Studies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore real-world examples of business growth, partnerships, and community impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {CASE_STUDIES.map((caseStudy) => (
              <Card key={caseStudy.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">{caseStudy.title}</CardTitle>
                  <CardDescription className="mb-2">{caseStudy.member}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-700 text-sm mb-4">{caseStudy.summary}</p>
                  <ul className="text-left space-y-2 mb-4">
                    {caseStudy.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/events">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Reserve Your Spot
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join 150+ San Antonio business leaders who are growing, connecting, and making an impact with BASA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-purple-50">
              <Link href="/membership/join">Join BASA Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/events">Attend an Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 