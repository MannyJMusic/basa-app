import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TrendingUp, Users, BookOpen, Star, Calendar, Heart, Lightbulb, PenLine, ChevronRight } from "lucide-react"
import { Metadata } from "next"

const CATEGORIES = [
  { name: "Networking Tips", icon: Users },
  { name: "Member Spotlights", icon: Star },
  { name: "Industry Insights", icon: TrendingUp },
  { name: "Event Recaps", icon: Calendar },
  { name: "Community Impact", icon: Heart },
  { name: "Business Resources", icon: BookOpen },
]

const FEATURED_POSTS = [
  {
    slug: "networking-tips-for-san-antonio-entrepreneurs",
    title: "7 Networking Tips for San Antonio Entrepreneurs",
    excerpt: "Unlock the secrets to building authentic business relationships in San Antonio's thriving market.",
    category: "Networking Tips",
    date: "2024-02-01",
    author: "Sarah Johnson",
    featured: true,
  },
  {
    slug: "member-spotlight-jennifer-martinez",
    title: "Member Spotlight: Jennifer Martinez of TechFlow Solutions",
    excerpt: "How Jennifer scaled her startup from 3 to 25 employees with BASA's support.",
    category: "Member Spotlights",
    date: "2024-01-25",
    author: "BASA Team",
    featured: true,
  },
  {
    slug: "san-antonio-market-insights-q1-2024",
    title: "San Antonio Market Insights: Q1 2024",
    excerpt: "Key trends, opportunities, and challenges for local businesses this quarter.",
    category: "Industry Insights",
    date: "2024-01-18",
    author: "BASA Research",
    featured: true,
  },
  {
    slug: "basa-january-mixer-recap",
    title: "Event Recap: January BASA Mixer",
    excerpt: "Photos, highlights, and key takeaways from our first event of the year.",
    category: "Event Recaps",
    date: "2024-01-10",
    author: "BASA Team",
    featured: false,
  },
  {
    slug: "community-impact-2023-highlights",
    title: "Community Impact: 2023 Highlights",
    excerpt: "How BASA members gave back and made a difference in San Antonio.",
    category: "Community Impact",
    date: "2024-01-05",
    author: "BASA Team",
    featured: false,
  },
  {
    slug: "how-to-create-a-business-proposal",
    title: "How to Create a Winning Business Proposal",
    excerpt: "Step-by-step guide and free template for BASA members.",
    category: "Business Resources",
    date: "2023-12-20",
    author: "BASA Team",
    featured: false,
  },
]

export const metadata: Metadata = {
  title: "San Antonio Business Networking Blog | BASA",
  description: "Networking tips, member spotlights, industry insights, event recaps, and business resources for San Antonio entrepreneurs.",
  keywords: "San Antonio business networking, professional associations San Antonio, business networking events San Antonio, San Antonio entrepreneurs networking, business partnerships San Antonio",
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              BASA Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              San Antonio Business Networking Insights
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Weekly tips, member stories, event recaps, and resources to help you grow your business and network in San Antonio.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {CATEGORIES.map((cat) => (
              <Button key={cat.name} variant="outline" className="flex items-center gap-2">
                <cat.icon className="w-5 h-5" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_POSTS.map((post) => (
              <Card key={post.slug} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <Badge className="mb-2 bg-blue-100 text-blue-800">{post.category}</Badge>
                  <CardTitle className="text-xl mb-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="mb-2 text-gray-600">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center text-xs text-gray-500 gap-2">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.author}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/blog/${post.slug}`}>
                      Read More <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Write for Us CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Want to Share Your Story or Expertise?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            BASA welcomes guest posts from members and San Antonio business leaders. Share your networking tips, success stories, or industry insights with our community.
          </p>
          <Button asChild size="lg" className="basa-btn-white basa-text-navy">
            <Link href="/blog/write">Write for Us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
} 