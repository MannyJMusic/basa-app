import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  TrendingUp, 
  Play, 
  Users, 
  Handshake,
  Download,
  BookOpen,
  Lightbulb,
  Building2,
  Target,
  Star,
  Clock
} from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Member Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exclusive Member Toolkit - Resources Worth Your Investment
            </h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Access premium business resources, templates, and insights contributed by your fellow BASA members. 
              Everything you need to accelerate your business growth and success.
            </p>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Templates & Tools */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Most Popular
                  </Badge>
                </div>
                <CardTitle className="text-xl">📋 Templates & Tools</CardTitle>
                <CardDescription>
                  Professional templates and tools contributed by BASA members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Service Agreement Template</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Proposal Template</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Marketing Materials Kit</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/resources/templates">View All Templates</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Industry Insights */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Updated Weekly
                  </Badge>
                </div>
                <CardTitle className="text-xl">📊 Industry Insights</CardTitle>
                <CardDescription>
                  Market reports, trend analysis, and economic updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">San Antonio Market Report</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Lightbulb className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Industry Trend Analysis</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Economic Outlook Q1 2024</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/resources/insights">View All Insights</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Educational Content */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    New Content
                  </Badge>
                </div>
                <CardTitle className="text-xl">🎓 Educational Content</CardTitle>
                <CardDescription>
                  Webinar recordings, how-to guides, and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Play className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Digital Marketing Masterclass</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Sales Strategy Guide</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Lightbulb className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Business Growth Tips</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/resources/education">View All Content</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Member Expertise */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Exclusive
                  </Badge>
                </div>
                <CardTitle className="text-xl">👥 Member Expertise</CardTitle>
                <CardDescription>
                  Access to consultations and services from fellow members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Legal Consultation</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Financial Planning</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Marketing Strategy</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/resources/expertise">Browse Experts</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Partnership Opportunities */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Handshake className="w-6 h-6 text-red-600" />
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-xl">🤝 Partnership Opportunities</CardTitle>
                <CardDescription>
                  Joint venture possibilities and collaboration requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Handshake className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Tech Startup Collaboration</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Respond
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Real Estate Joint Venture</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Respond
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Marketing Partnership</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Respond
                    </Button>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/resources/partnerships">View Opportunities</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Resource Stats */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl">Resource Usage Statistics</CardTitle>
                <CardDescription>
                  Track your resource engagement and downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-600">Templates Downloaded</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Reports Read</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Videos Watched</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <div className="text-sm text-gray-600">Expert Consultations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Contribute Your Expertise?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Share your knowledge and resources with fellow BASA members. 
            Contribute templates, insights, or offer your professional services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-green-900 hover:bg-green-50">
              <Link href="/dashboard/resources/contribute">Contribute Resources</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/dashboard/resources/expertise">Offer Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 