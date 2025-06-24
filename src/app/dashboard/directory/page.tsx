import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Search, 
  MapPin, 
  Building2, 
  Phone,
  Mail,
  Globe,
  Handshake,
  Star,
  Filter,
  Calendar,
  Target,
  Award,
  Bookmark,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  X
} from "lucide-react"

export default function DirectoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
          <p className="text-gray-600 mt-2">Connect with 150+ business leaders across San Antonio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Bookmark className="w-4 h-4 mr-2" />
            Saved Searches
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">150</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Handshake className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-gray-600">Your Connections</p>
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
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">New This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search by name, company, or services..." 
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Industry Filter */}
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Location Filter */}
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="downtown">Downtown SA</SelectItem>
                  <SelectItem value="north">North SA</SelectItem>
                  <SelectItem value="south">South SA</SelectItem>
                  <SelectItem value="east">East SA</SelectItem>
                  <SelectItem value="west">West SA</SelectItem>
                  <SelectItem value="suburbs">Suburbs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="innovator">Innovator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="recentlyActive" />
                  <Label htmlFor="recentlyActive" className="text-sm">Recently Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="openToConnect" />
                  <Label htmlFor="openToConnect" className="text-sm">Open to Connect</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="verifiedMembers" />
                  <Label htmlFor="verifiedMembers" className="text-sm">Verified Members</Label>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Handshake className="w-5 h-5 text-green-600" />
            <span>Recent Connections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Sarah Johnson</p>
                <p className="text-xs text-gray-600">Connected 2 days ago</p>
              </div>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Mike Chen</p>
                <p className="text-xs text-gray-600">Connected 1 week ago</p>
              </div>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Lisa Rodriguez</p>
                <p className="text-xs text-gray-600">Connected 2 weeks ago</p>
              </div>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Members</h2>
          <div className="flex items-center space-x-2">
            <Select defaultValue="grid">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="recent">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="connections">Most Connections</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Member Card 1 */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                    <CardDescription>Marketing Consultant</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  Johnson Marketing Group
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  Downtown San Antonio
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Digital Marketing, Brand Strategy
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Member since 2021
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Handshake className="w-4 h-4 mr-2" />
                  8 connections made
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/dashboard/directory/profile/1">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/directory/connect/1">Connect</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Card 2 */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Michael Chen</CardTitle>
                    <CardDescription>Real Estate Developer</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Premium
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  Chen Development Group
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  North San Antonio
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Commercial Real Estate, Investment
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Member since 2020
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  Top Referrer 2023
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/dashboard/directory/profile/2">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/directory/connect/2">Connect</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Card 3 */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Lisa Rodriguez</CardTitle>
                    <CardDescription>Legal Consultant</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Expert
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  Rodriguez Legal Services
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  West San Antonio
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Business Law, Contract Review
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Member since 2022
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Handshake className="w-4 h-4 mr-2" />
                  15 consultations provided
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/dashboard/directory/profile/3">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/directory/connect/3">Connect</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Card 4 */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">David Thompson</CardTitle>
                    <CardDescription>Financial Advisor</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  Thompson Financial Group
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  South San Antonio
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Investment Planning, Retirement
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Member since 2021
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Handshake className="w-4 h-4 mr-2" />
                  12 connections made
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/dashboard/directory/profile/4">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/directory/connect/4">Connect</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Card 5 */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Jennifer Martinez</CardTitle>
                    <CardDescription>Tech Startup Founder</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Innovator
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  TechFlow Solutions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  East San Antonio
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  SaaS, Mobile Apps, Consulting
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Member since 2023
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  Rising Star Award
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/dashboard/directory/profile/5">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/directory/connect/5">Connect</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Card 6 */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Robert Wilson</CardTitle>
                    <CardDescription>Healthcare Administrator</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  Wilson Healthcare Management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  Suburbs
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Healthcare Management, Consulting
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Member since 2020
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Handshake className="w-4 h-4 mr-2" />
                  20 connections made
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/dashboard/directory/profile/6">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/directory/connect/6">Connect</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/directory?page=2">Load More Members</Link>
          </Button>
        </div>
      </div>

      {/* Connection Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Handshake className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Connection Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Log your interactions with fellow members and track relationship development.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/directory/connections">View Connections</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Follow-up Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Set reminders for follow-up calls, meetings, and relationship nurturing.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/directory/reminders">Manage Reminders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Referral Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Track successful referrals and earn rewards through our referral system.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/directory/referrals">View Referrals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 