import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Star, ChevronLeft, ChevronRight } from "lucide-react"

const SAMPLE_POSTS = {
  "networking-tips-for-san-antonio-entrepreneurs": {
    title: "7 Networking Tips for San Antonio Entrepreneurs",
    date: "2024-02-01",
    author: "Sarah Johnson",
    category: "Networking Tips",
    excerpt: "Unlock the secrets to building authentic business relationships in San Antonio's thriving market.",
    content: [
      "Networking is more than just exchanging business cards. In San Antonio's vibrant business community, authentic relationships drive real results. Here are 7 actionable tips to help you succeed:",
      "1. Attend local events regularly to build familiarity and trust.",
      "2. Focus on giving value before asking for referrals.",
      "3. Follow up promptly after every meeting or event.",
      "4. Leverage BASA's member directory to find strategic partners.",
      "5. Share your expertise by contributing to the BASA blog or speaking at events.",
      "6. Join community impact initiatives to build goodwill.",
      "7. Always be authentic—people do business with those they trust.",
      "Ready to put these tips into action? Join BASA or attend our next event!"
    ]
  },
  // Add more sample posts here...
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = SAMPLE_POSTS[params.slug] || SAMPLE_POSTS["networking-tips-for-san-antonio-entrepreneurs"]
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <head>
        <title>{post.title} | BASA Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content="San Antonio business networking, professional associations San Antonio, business networking events San Antonio, San Antonio entrepreneurs networking, business partnerships San Antonio" />
      </head>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-blue-100 text-blue-800">{post.category}</Badge>
            <span className="text-gray-500 text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> {post.date}
            </span>
            <span className="text-gray-500 text-sm flex items-center">
              <Users className="w-4 h-4 mr-1" /> {post.author}
            </span>
          </div>
          <p className="text-lg text-gray-600 mb-4">{post.excerpt}</p>
        </div>
        <div className="prose prose-blue max-w-none mb-8">
          {post.content.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Link href="/membership/join">Join BASA Today</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/events">Attend an Event</Link>
          </Button>
        </div>
        <div className="text-center text-gray-500 text-sm">
          <span>Want to contribute? </span>
          <Link href="/blog/write" className="text-blue-600 hover:underline">Write for Us</Link>
        </div>
      </div>
    </div>
  )
} 