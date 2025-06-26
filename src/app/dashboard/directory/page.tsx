'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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
  X,
  Crown
} from "lucide-react"
import { useMembers } from "@/hooks/use-members"

export default function DirectoryPage() {
  const { data: session } = useSession()
  const { members, loading, fetchMembers, pagination } = useMembers()
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    // Fetch members with filters
    const filters: any = {}
    if (searchTerm) filters.search = searchTerm
    if (industryFilter !== "all") filters.industry = industryFilter
    if (locationFilter !== "all") filters.city = locationFilter
    if (statusFilter !== "all") filters.status = statusFilter

    fetchMembers(filters, 1, 20, getSortField(sortBy), "desc")
  }, [searchTerm, industryFilter, locationFilter, statusFilter, sortBy, fetchMembers])

  const getSortField = (sort: string) => {
    switch (sort) {
      case "name": return "firstName"
      case "company": return "businessName"
      case "connections": return "joinedAt"
      default: return "joinedAt"
    }
  }

  // Filter members based on search
  const filteredMembers = members.filter(member => {
    if (!member.showInDirectory) return false
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      member.user.firstName?.toLowerCase().includes(searchLower) ||
      member.user.lastName?.toLowerCase().includes(searchLower) ||
      member.businessName?.toLowerCase().includes(searchLower) ||
      member.industry.some(ind => ind.toLowerCase().includes(searchLower))

    return matchesSearch
  })

  // Get unique industries for filter
  const industries = Array.from(new Set(members.flatMap(m => m.industry))).sort()
  
  // Get unique cities for filter
  const cities = Array.from(new Set(members.map(m => m.city).filter(Boolean))).sort() as string[]

  // Calculate stats
  const totalMembers = members.length
  const activeMembers = members.filter(m => m.membershipStatus === "ACTIVE").length
  const premiumMembers = members.filter(m => m.membershipTier === "PREMIUM" || m.membershipTier === "VIP").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
          <p className="text-gray-600 mt-2">Connect with {totalMembers}+ business leaders across San Antonio</p>
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
                <p className="text-2xl font-bold">{totalMembers}</p>
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
                <p className="text-2xl font-bold">{activeMembers}</p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{premiumMembers}</p>
                <p className="text-sm text-gray-600">Premium Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{members.filter(m => {
                  const joinedDate = new Date(m.joinedAt)
                  const oneMonthAgo = new Date()
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                  return joinedDate >= oneMonthAgo
                }).length}</p>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Industry Filter */}
            <div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location Filter */}
            <div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
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
            {members.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="text-xs text-gray-600">
                    Connected {index + 1} {index === 0 ? 'day' : 'days'} ago
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Members</h2>
          <div className="flex items-center space-x-2">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
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

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No members found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {member.user.firstName} {member.user.lastName}
                        </CardTitle>
                        <CardDescription>{member.businessType || 'Business Owner'}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Badge variant="secondary" className={getStatusBadgeColor(member.membershipStatus)}>
                        {member.membershipStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {member.businessName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        {member.businessName}
                      </div>
                    )}
                    {member.city && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {member.city}{member.state && `, ${member.state}`}
                      </div>
                    )}
                    {member.industry.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="w-4 h-4 mr-2" />
                        {member.industry.slice(0, 2).join(", ")}
                        {member.industry.length > 2 && "..."}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      Member since {new Date(member.joinedAt).getFullYear()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Handshake className="w-4 h-4 mr-2" />
                      {member.eventRegistrations.length} events attended
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/dashboard/directory/profile/${member.id}`}>View Profile</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/directory/connect/${member.id}`}>Connect</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {pagination && pagination.hasNextPage && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href={`/dashboard/directory?page=${pagination.page + 1}`}>Load More Members</Link>
            </Button>
          </div>
        )}
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

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800'
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
} 