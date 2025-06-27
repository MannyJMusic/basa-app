'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Star,
  Heart,
  Building2,
  Filter,
  ArrowRight,
  DollarSign,
  Crown,
  CalendarDays,
  Ticket
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"

export default function MyEventsPage() {
  const { data: session } = useSession()
  const { events, loading, fetchEvents } = useEvents()
  const [searchTerm, setSearchTerm] = useState("")
  const [eventType, setEventType] = useState("all")
  const [status, setStatus] = useState("all")

  useEffect(() => {
    fetchEvents({}, 1, 20, "startDate", "asc")
  }, [fetchEvents])

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = eventType === "all" || event.category.toLowerCase() === eventType
    const matchesStatus = status === "all" || event.status.toLowerCase() === status
    return matchesSearch && matchesType && matchesStatus
  })

  // Separate upcoming and past events
  const upcomingEvents = filteredEvents.filter(event => new Date(event.endDate) >= new Date())
  const pastEvents = filteredEvents.filter(event => new Date(event.endDate) < new Date())

  // Check if user is a member
  const isMember = session?.user?.role === "MEMBER"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-2">Manage your event registrations and track your networking activities</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline">
            <Link href="/events/calendar">
              <CalendarDays className="w-4 h-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/events">
              <Plus className="w-4 h-4 mr-2" />
              Browse All Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Member Benefits Banner */}
      {isMember && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-300" />
                <div>
                  <h3 className="text-lg font-semibold">Member Benefits Active</h3>
                  <p className="text-blue-100">You have access to special member pricing and priority registration</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                50% Off Events
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-600">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
                <p className="text-sm text-gray-600">Events Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
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
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search events..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No upcoming events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {event.category}
                    </Badge>
                    {event.isFeatured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>
                    {event.shortDescription || event.description?.slice(0, 100) + '...'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(event.endDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Capacity: {event.capacity || 'N/A'}
                  </div>
                  
                  {/* Member Pricing Display */}
                  {session?.user?.role === "GUEST" ? (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-blue-700">
                          ${(Number(event.price) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Member Price:</span>
                        <span className="font-semibold text-green-700">
                          ${(Number(event.memberPrice) || 0).toFixed(2)}
                        </span>
                      </div>
                      {isMember && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>Regular Price:</span>
                          <span className="line-through">${(Number(event.price) || 0).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/events/${event.slug}`}>View Details</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/events/${event.slug}/register`}>
                        <Ticket className="w-4 h-4 mr-1" />
                        Register
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Past Events */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Past Events</h2>
        <div className="space-y-4">
          
          {/* Past Event 1 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">February Business Mixer</h3>
                    <p className="text-sm text-gray-600">February 15, 2024 • 6:00 PM</p>
                    <p className="text-sm text-gray-600">The Pearl Brewery</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                    Attended
                  </Badge>
                  <p className="text-sm text-gray-600">8 connections made</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Past Event 2 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Leadership Development Seminar</h3>
                    <p className="text-sm text-gray-600">February 8, 2024 • 9:00 AM</p>
                    <p className="text-sm text-gray-600">BASA Conference Center</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                    Attended
                  </Badge>
                  <p className="text-sm text-gray-600">5 connections made</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Past Event 3 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tech Startup Networking</h3>
                    <p className="text-sm text-gray-600">February 1, 2024 • 7:00 PM</p>
                    <p className="text-sm text-gray-600">Geekdom</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-red-100 text-red-800 mb-2">
                    Cancelled
                  </Badge>
                  <p className="text-sm text-gray-600">Schedule conflict</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span>Recommended for You</span>
          </CardTitle>
          <CardDescription>
            Based on your interests and past attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Real Estate Investment Panel</h4>
                <p className="text-sm text-gray-600">March 28, 2024 • 6:30 PM</p>
                <p className="text-xs text-green-600 font-medium">Member Price: $25</p>
              </div>
              <Button size="sm" asChild>
                <Link href="/events/real-estate-investment-panel/register">Register</Link>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Women in Business Luncheon</h4>
                <p className="text-sm text-gray-600">April 12, 2024 • 12:00 PM</p>
                <p className="text-xs text-green-600 font-medium">Member Price: $30</p>
              </div>
              <Button size="sm" asChild>
                <Link href="/events/women-in-business-luncheon/register">Register</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your event experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Link href="/events/calendar">
                <CalendarDays className="w-6 h-6" />
                <span>View Calendar</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Link href="/events">
                <Plus className="w-6 h-6" />
                <span>Browse All Events</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Link href="/dashboard/profile">
                <Users className="w-6 h-6" />
                <span>Update Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 