import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Download, 
  FileText, 
  Play, 
  Users, 
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Gift,
  Lock,
  Eye,
  Video,
  Headphones,
  Target
} from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Free Business Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              San Antonio Business Networking Success Guide
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Access exclusive resources, insights, and tools to accelerate your business growth. 
              Join 150+ successful businesses who've transformed their networking through BASA.
            </p>
          </div>
        </div>
      </section>

      {/* Lead Magnets Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Free Resources to Jumpstart Your Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Download these exclusive resources and discover how BASA members are building 
              meaningful connections and growing their businesses in San Antonio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            
            {/* Success Guide */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">Most Popular</Badge>
                <CardTitle className="text-xl">San Antonio Business Networking Success Guide</CardTitle>
                <CardDescription>
                  15-page downloadable PDF with proven networking strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>15 pages of actionable content</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Local networking strategies</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Member success stories</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/resources/download/success-guide">
                    <Download className="w-4 h-4 mr-2" />
                    Download Free Guide
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* First-Timer's Event Pass */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800 mb-2">Limited Time</Badge>
                <CardTitle className="text-xl">First-Timer's Event Pass</CardTitle>
                <CardDescription>
                  Complimentary ticket for new prospects to experience BASA
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Free event attendance</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Network with 150+ members</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>No obligation to join</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/resources/request-guest-pass">
                    <Calendar className="w-4 h-4 mr-2" />
                    Request Guest Pass
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Member Success Stories */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-800 mb-2">Video Series</Badge>
                <CardTitle className="text-xl">Member Success Stories</CardTitle>
                <CardDescription>
                  Video testimonials and case studies from BASA members
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Real member testimonials</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Case study examples</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Growth strategies revealed</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/resources/success-stories">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Success Stories
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Market Insights */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-800 mb-2">Weekly Updates</Badge>
                <CardTitle className="text-xl">Monthly Market Insights</CardTitle>
                <CardDescription>
                  Email newsletter with business intelligence and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Local market analysis</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Industry trend reports</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Exclusive business tips</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                  <Link href="/resources/newsletter-signup">
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe Free
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Conversion Funnel - Awareness Stage */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Path to Business Networking Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our proven conversion funnel to maximize your networking results 
              and build meaningful business relationships in San Antonio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Awareness Stage */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">Stage 1</Badge>
                <CardTitle className="text-xl">Awareness</CardTitle>
                <CardDescription>
                  Discover BASA and our value proposition
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Download free resources</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Attend guest events</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Subscribe to newsletter</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/resources">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Consideration Stage */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800 mb-2">Stage 2</Badge>
                <CardTitle className="text-xl">Consideration</CardTitle>
                <CardDescription>
                  Evaluate BASA membership benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Attend member events</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Preview member directory</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Meet current members</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Decision Stage */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-800 mb-2">Stage 3</Badge>
                <CardTitle className="text-xl">Decision</CardTitle>
                <CardDescription>
                  Join BASA and start networking
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Limited-time offers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Payment plan options</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Immediate access</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/membership/join">Join BASA Today</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Connected with San Antonio's Business Community
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Get weekly insights, networking tips, and exclusive member spotlights delivered to your inbox.
            </p>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                <Input 
                  placeholder="Last Name" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
              </div>
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
              />
              <Button size="lg" className="w-full bg-white text-blue-900 hover:bg-blue-50">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe to Market Insights
              </Button>
              <p className="text-sm text-blue-200">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business Networking?
          </h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Join 150+ successful businesses who've discovered the power of meaningful connections through BASA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/membership/join">Join BASA Today - First Month Free!</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Schedule Leadership Meeting</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 