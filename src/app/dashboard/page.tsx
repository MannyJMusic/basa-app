import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Handshake,
  Star,
  MapPin,
  Clock,
  Target,
  Building2,
  Heart,
  Award,
  CheckCircle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Member Dashboard
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Your BASA Command Center
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Access your exclusive member benefits, connect with fellow business leaders, 
              and discover resources designed to accelerate your success.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Events Attended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Connections Made</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Referrals Given</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">15</div>
              <div className="text-sm text-gray-600">Resources Used</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Member Directory */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Popular
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">Member Directory</CardTitle>
                    <CardDescription>
                      Connect with 150+ business leaders across San Antonio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-blue-600" />
                        Advanced search by industry & location
                      </li>
                      <li className="flex items-center">
                        <Handshake className="w-4 h-4 mr-2 text-blue-600" />
                        Track connections & interactions
                      </li>
                      <li className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-blue-600" />
                        Referral system & rewards
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/directory">Browse Directory</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Business Resources */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        New
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">Business Resources</CardTitle>
                    <CardDescription>
                      Exclusive member toolkit and resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-green-600" />
                        Templates & tools
                      </li>
                      <li className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                        Industry insights & reports
                      </li>
                      <li className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-green-600" />
                        Member expertise access
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/resources">Access Resources</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Events */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">Upcoming Events</CardTitle>
                    <CardDescription>
                      Register for networking events and activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-600" />
                        Monthly mixer - Next week
                      </li>
                      <li className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-purple-600" />
                        Ribbon cutting - This Friday
                      </li>
                      <li className="flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-purple-600" />
                        Giving initiative - Next month
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/events">View Events</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Networking History */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">Networking History</CardTitle>
                    <CardDescription>
                      Track your networking journey and connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-orange-600" />
                        Past event attendance
                      </li>
                      <li className="flex items-center">
                        <Handshake className="w-4 h-4 mr-2 text-orange-600" />
                        Connections made
                      </li>
                      <li className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-orange-600" />
                        Referral tracking
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/profile">View History</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest interactions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Handshake className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Connected with John Smith</p>
                        <p className="text-xs text-gray-500">2 days ago • Monthly Mixer</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Downloaded Contract Template</p>
                        <p className="text-xs text-gray-500">3 days ago • Business Resources</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Referred client to Sarah Johnson</p>
                        <p className="text-xs text-gray-500">1 week ago • Referral System</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-gray-600">Marketing Consultant</p>
                    <p className="text-xs text-gray-500">Member since 2022</p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/profile">Edit Profile</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/dashboard/account">Account Settings</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/dashboard/settings">Preferences</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/contact">Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Member Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Member Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">Exclusive networking events</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">Business resource library</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">Referral rewards program</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">Community partnerships</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 