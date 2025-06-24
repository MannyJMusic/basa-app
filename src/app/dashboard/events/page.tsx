'use client'

import Link from "next/link"
import { useEffect } from "react"
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
  Building2
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"

export default function MyEventsPage() {
  const { events, loading, fetchEvents } = useEvents()

  useEffect(() => {
    fetchEvents({ sortBy: "startDate", sortOrder: "asc" })
  }, [fetchEvents])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-2">Manage your event registrations and track your networking activities</p>
        </div>
        <Button asChild>
          <Link href="/events">
            <Plus className="w-4 h-4 mr-2" />
            Browse All Events
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">8</p>
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
                <p className="text-2xl font-bold">24</p>
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
                <Input placeholder="Search events..." className="pl-10" disabled />
              </div>
            </div>
            <Select defaultValue="all" disabled>
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
            <Select defaultValue="all" disabled>
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
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No upcoming events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .filter(event => new Date(event.endDate) >= new Date())
              .map(event => (
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
                    <div className="flex space-x-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/dashboard/events/${event.slug}`}>View Details</Link>
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
              </div>
              <Button size="sm">Register</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Women in Business Luncheon</h4>
                <p className="text-sm text-gray-600">April 12, 2024 • 12:00 PM</p>
              </div>
              <Button size="sm">Register</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 