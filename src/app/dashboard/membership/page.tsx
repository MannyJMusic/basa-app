import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  Star, 
  Users, 
  Calendar, 
  CreditCard, 
  Download,
  Award,
  CheckCircle,
  TrendingUp,
  Heart,
  Building2,
  Globe,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Plus,
  Gift,
  Shield,
  Zap
} from "lucide-react"

export default function MembershipPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Membership</h1>
          <p className="text-gray-600 mt-2">Manage your BASA membership and access exclusive benefits</p>
        </div>
        <Button asChild>
          <Link href="/membership/compare">
            <ArrowRight className="w-4 h-4 mr-2" />
            Compare Plans
          </Link>
        </Button>
      </div>

      {/* Current Membership Status */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Premium Membership</h2>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Active
                  </Badge>
                </div>
                <p className="text-gray-600">Member since January 2022</p>
                <p className="text-sm text-gray-500">Next renewal: March 15, 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">$299</p>
              <p className="text-sm text-gray-600">per year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-gray-600">Events Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-gray-600">Connections Made</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Referrals Given</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Awards Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Benefits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Your Premium Benefits</span>
              </CardTitle>
              <CardDescription>
                Exclusive features and services included with your membership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Unlimited Networking</h4>
                    <p className="text-sm text-gray-600">Access to all networking events and member directory</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Resource Library</h4>
                    <p className="text-sm text-gray-600">Full access to business templates and tools</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Referral Rewards</h4>
                    <p className="text-sm text-gray-600">Earn rewards for successful member referrals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Priority Support</h4>
                    <p className="text-sm text-gray-600">Direct access to BASA leadership and support</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Business Directory</h4>
                    <p className="text-sm text-gray-600">Featured listing in BASA business directory</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Award Nominations</h4>
                    <p className="text-sm text-gray-600">Eligible for annual BASA awards and recognition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Membership Usage</span>
              </CardTitle>
              <CardDescription>
                Track how you're utilizing your membership benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Event Attendance</span>
                  <span className="text-sm text-gray-600">24/30 events</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Resource Downloads</span>
                  <span className="text-sm text-gray-600">45/50 downloads</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Networking Connections</span>
                  <span className="text-sm text-gray-600">156/200 connections</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Referral Program</span>
                  <span className="text-sm text-gray-600">12/15 referrals</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Upcoming Premium Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Premium Networking Mixer</h4>
                    <p className="text-sm text-gray-600">March 15, 2024 • 6:00 PM</p>
                    <p className="text-sm text-gray-600">The Pearl Brewery</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Registered
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Leadership Development Workshop</h4>
                    <p className="text-sm text-gray-600">March 22, 2024 • 9:00 AM</p>
                    <p className="text-sm text-gray-600">BASA Conference Center</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Available
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Exclusive Industry Panel</h4>
                    <p className="text-sm text-gray-600">April 5, 2024 • 7:00 PM</p>
                    <p className="text-sm text-gray-600">Downtown Business Club</p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Premium Only
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Billing Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-gray-600">Premium Membership</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Next Billing Date</p>
                <p className="text-sm text-gray-600">March 15, 2024</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm text-gray-600">$299.00/year</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-gray-600">•••• •••• •••• 1234</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Update Payment
                </Button>
                <Button variant="outline">
                  View Invoices
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Membership Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/events">Browse Events</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/directory">Member Directory</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/resources">Access Resources</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/membership/compare">Compare Plans</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Referral Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-purple-600" />
                <span>Referral Program</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Earn Rewards</p>
                  <p className="text-sm text-gray-600">Refer new members and earn exclusive benefits</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Referrals This Year</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Rewards Earned</span>
                    <span className="font-medium">$240</span>
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Premium Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm">Direct Phone Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-sm">Priority Email Response</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm">24/7 Online Support</span>
              </div>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span>Upgrade Your Experience</span>
          </CardTitle>
          <CardDescription>
            Unlock additional benefits and features with our premium tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Executive Membership</h3>
              <p className="text-sm text-gray-600 mb-3">Enhanced networking and exclusive events</p>
              <p className="text-2xl font-bold text-blue-600 mb-3">$499/year</p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Founder's Circle</h3>
              <p className="text-sm text-gray-600 mb-3">VIP access and leadership opportunities</p>
              <p className="text-2xl font-bold text-yellow-600 mb-3">$999/year</p>
              <Button size="sm">
                Upgrade Now
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Lifetime Membership</h3>
              <p className="text-sm text-gray-600 mb-3">One-time payment for lifetime access</p>
              <p className="text-2xl font-bold text-purple-600 mb-3">$2,999</p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 