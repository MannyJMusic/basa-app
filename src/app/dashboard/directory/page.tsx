import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Award
} from "lucide-react"

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Member Directory
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Connect with 150+ Business Leaders
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Advanced search, business profiles, and connection tracking to help you build 
              meaningful relationships with fellow BASA members.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="downtown">Downtown SA</SelectItem>
                    <SelectItem value="north">North SA</SelectItem>
                    <SelectItem value="south">South SA</SelectItem>
                    <SelectItem value="east">East SA</SelectItem>
                    <SelectItem value="west">West SA</SelectItem>
                    <SelectItem value="suburbs">Suburbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Stats */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">150</span> Total Members
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">12</span> Industries
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">6</span> Locations
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Advanced Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Recent Activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
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
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Premium
                    </Badge>
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
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Expert
                    </Badge>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
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
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Innovator
                    </Badge>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
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
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/directory?page=2">Load More Members</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Connection Tracking Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Track Your Connections
              </h2>
              <p className="text-xl text-gray-600">
                Log interactions, set follow-up reminders, and track successful referrals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Handshake className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-center">Connection Log</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Log your interactions with fellow members and track relationship development.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/directory/connections">View Connections</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-center">Follow-up Reminders</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Set reminders for follow-up calls, meetings, and relationship nurturing.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/directory/reminders">Manage Reminders</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-center">Referral Tracking</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Track successful referrals and earn rewards through our referral system.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/directory/referrals">View Referrals</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 