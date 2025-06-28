'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  CalendarDays, 
  CheckCircle, 
  Clock, 
  Crown, 
  Eye,
  Grid3X3, 
  List, 
  MapPin, 
  Search, 
  Star, 
  Users, 
  X,
  XCircle 
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { EventsDisplay } from "@/components/events/events-display"

export default function MyEventsPage() {
  const { data: session } = useSession()
  const { events, loading, fetchEvents } = useEvents()
  const [searchTerm, setSearchTerm] = useState('')
  const [eventType, setEventType] = useState('all')
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents({}, 1, 20, "startDate", "asc")
  }, [fetchEvents])

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = eventType === "all" || event.category.toLowerCase() === eventType
    return matchesSearch && matchesType
  })

  // Separate upcoming and past events
  const upcomingEvents = filteredEvents.filter(event => new Date(event.endDate) >= new Date())
  const pastEvents = filteredEvents.filter(event => new Date(event.endDate) < new Date())

  // Check if user is a member
  const isMember = session?.user?.role === "MEMBER"
  const isGuest = session?.user?.role === "GUEST"

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null) // Deselect if already selected
    } else {
      setSelectedCategory(category)
    }
  }

  return (
    <div className="space-y-6">
      {/* Member Benefits Banner */}
      {isMember && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className={isBannerCollapsed ? "p-3" : "p-6"}>
            {isBannerCollapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-semibold">Member Benefits Active</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  onClick={() => setIsBannerCollapsed(false)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 text-white hover:bg-white/20 h-6 w-6 p-0"
                  onClick={() => setIsBannerCollapsed(true)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-yellow-300" />
                    <div>
                      <h3 className="text-lg font-semibold">Member Benefits Active</h3>
                      <p className="text-blue-100">You have access to special member pricing and priority registration</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Discounted member price
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-2">Manage your event registrations and track your networking activities</p>
        </div>
      </div>

      {/* Search and Filters - Full Width */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search events..." 
                  className="pl-10 w-full" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-full">
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
            </div>
            <div className="md:col-span-1"></div>
            <div className="flex justify-end space-x-2 w-full">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content and Side Panel */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Upcoming Events */}
          <EventsDisplay 
            events={upcomingEvents}
            loading={loading}
            title=""
            emptyMessage="No upcoming events found."
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            eventType={eventType}
            setEventType={setEventType}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Member Benefits Banner */}
          {isGuest && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Unlock Full Access</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Join BASA as a member to access exclusive events, networking opportunities, and member-only benefits.
                    </p>
                    <Button size="sm" className="w-full">
                      <Link href="/membership/join" className="w-full">
                        Become a Member
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Categories Legend - Clickable */}
          <Card>
            <CardHeader>
              <CardTitle>Event Categories</CardTitle>
              <CardDescription>Click on a category to filter events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Networking', color: 'bg-blue-100', type: 'networking' },
                { name: 'Ribbon Cutting', color: 'bg-orange-100', type: 'ribbon_cutting' },
                { name: 'Summit', color: 'bg-green-100', type: 'summit' },
                { name: 'Community', color: 'bg-red-100', type: 'community' },
                { name: 'Educational', color: 'bg-purple-100', type: 'educational' },
                { name: 'Social', color: 'bg-pink-100', type: 'social' },
                { name: 'Charity', color: 'bg-yellow-100', type: 'charity' }
              ].map((category) => (
                <div 
                  key={category.type}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedCategory === category.type 
                      ? 'bg-gray-200 ring-2 ring-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCategoryClick(category.type)}
                >
                  <div className={`w-4 h-4 ${category.color} rounded`}></div>
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 