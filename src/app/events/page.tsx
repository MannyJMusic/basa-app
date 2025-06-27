'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  DollarSign,
  Target,
  Award,
  Handshake,
  TrendingUp,
  Building2,
  Heart,
  ArrowRight,
  Filter,
  Search,
  List,
  Grid3X3,
  Calendar as CalendarIcon,
  Info
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"

export default function EventsPage() {
  const { events, loading, fetchEvents } = useEvents()

  // Add state for search and filter
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Fetch events on mount and when filters change
  useEffect(() => {
    fetchEvents(
      {
        status: "PUBLISHED",
        search: searchQuery || undefined,
        type: (filterType as 'NETWORKING' | 'SUMMIT' | 'RIBBON_CUTTING' | 'COMMUNITY' | undefined) || undefined,
      },
      1,
      20,
      "startDate",
      "asc"
    )
  }, [fetchEvents, searchQuery, filterType])

  console.log('EventsPage: render', { events, loading, eventsLength: events?.length })
  
  // Debug: Log each event
  if (events && events.length > 0) {
    console.log('EventsPage: Events received:')
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} - ${event.endDate}`)
    })
  } else {
    console.log('EventsPage: No events received')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/backgrounds/calendar-2-bg.jpg')"
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-purple-700/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Calendar
            </Badge>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 text-basa-gold"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 1px 0 #000' }}
            >
              Connect at San Antonio's Premier Business Events
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Join BASA's curated networking events designed to accelerate your business growth, 
              build meaningful connections, and stay ahead of industry trends.
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Headline and subheadline at the top */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't miss these exclusive networking opportunities designed to accelerate your business success.
            </p>
          </div>
          {/* Controls row: search, filter, calendar, view toggles */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  placeholder="Search events..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                disabled={loading}
              >
                <option value="">All Types</option>
                <option value="NETWORKING">Networking</option>
                <option value="SUMMIT">Summit</option>
                <option value="RIBBON_CUTTING">Ribbon Cutting</option>
                <option value="COMMUNITY">Community</option>
              </select>
            </div>
            <div className="flex gap-2 justify-center md:justify-end items-center relative">
              <button
                className={`p-2 rounded border ${viewMode === 'list' ? 'bg-basa-gold text-basa-navy border-basa-gold' : 'bg-white text-gray-500 border-gray-300'} transition`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded border ${viewMode === 'grid' ? 'bg-basa-gold text-basa-navy border-basa-gold' : 'bg-white text-gray-500 border-gray-300'} transition`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <Link
                href="/events/calendar"
                className="p-2 rounded border bg-white text-gray-500 border-gray-300 hover:bg-basa-gold hover:text-basa-navy hover:border-basa-gold transition flex items-center justify-center"
                aria-label="View Calendar"
                title="View Calendar"
              >
                <CalendarIcon className="w-5 h-5" />
              </Link>
              {/* Info icon with tooltip */}
              <div className="relative group ml-2">
                <Info className="w-4 h-4 text-gray-400 cursor-pointer group-hover:text-basa-gold group-focus:text-basa-gold" tabIndex={0} />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white text-basa-navy text-sm rounded shadow-lg p-3 z-20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
                  Toggle between list and grid views. Use the calendar icon to see events in a calendar format.
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading events...</p>
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming events found.</p>
              <p className="text-sm mt-2">Debug info: events array length = {events?.length || 0}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <Card key={event.id} className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      {event.isFeatured && (
                        <Badge variant="secondary" className="bg-basa-gold text-basa-navy border-basa-gold">
                          Featured Event
                        </Badge>
                      )}
                      <div className="text-sm opacity-90">
                        {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white">
                      <Link 
                        href={`/events/${event.slug}`}
                        className="hover:text-blue-200 transition-colors duration-200"
                      >
                        {event.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {event.shortDescription || event.description?.slice(0, 100) + '...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                          <span>{new Date(event.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(event.endDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-3 text-purple-600" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-3 text-purple-600" />
                          <span>Capacity: {event.capacity || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">
                          <DollarSign className="inline w-4 h-4 mr-1" /> Pricing
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Member Price:</span>
                            <span className="font-semibold text-green-700">${(Number(event.memberPrice) || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Non-Member Price:</span>
                            <span className="font-semibold">${(Number(event.price) || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <Link href={`/events/${event.slug}/register`}>Register Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {events.map(event => (
                <Card key={event.id} className="flex flex-col md:flex-row items-stretch border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-1 p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {event.isFeatured && (
                          <Badge variant="secondary" className="bg-basa-gold text-basa-navy border-basa-gold">
                            Featured Event
                          </Badge>
                        )}
                        <div className="text-sm opacity-90">
                          {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <CardTitle className="text-2xl text-white mb-2">
                        <Link 
                          href={`/events/${event.slug}`}
                          className="hover:text-blue-200 transition-colors duration-200"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-blue-100 mb-2">
                        {event.shortDescription || event.description?.slice(0, 100) + '...'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center text-gray-100">
                        <Calendar className="w-4 h-4 mr-2 text-basa-gold" />
                        <span>{new Date(event.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(event.endDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-center text-gray-100">
                        <MapPin className="w-4 h-4 mr-2 text-basa-gold" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-100">
                        <Users className="w-4 h-4 mr-2 text-basa-gold" />
                        <span>Capacity: {event.capacity || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between bg-white rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-green-900 mb-2">
                        <DollarSign className="inline w-4 h-4 mr-1" /> Pricing
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Member Price:</span>
                          <span className="font-semibold text-green-700">${(Number(event.memberPrice) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Non-Member Price:</span>
                          <span className="font-semibold">${(Number(event.price) || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link href={`/events/${event.slug}/register`}>Register Now</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Benefits Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/backgrounds/basa-event-bg.jpg')"
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-basa-navy/70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-basa-teal mb-4"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 1.5px 0 #000' }}
            >
              Why Attend BASA Events?
            </h2>
            <p
              className="text-xl text-white max-w-3xl mx-auto"
              style={{ textShadow: '0 3px 16px rgba(0,0,0,0.85), 0 1px 0 #000' }}
            >
              Our events are designed to deliver measurable business value and meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Networking Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with industry leaders, potential clients, and business partners in a professional setting.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Business Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Learn from experts, discover new opportunities, and gain insights to accelerate your business success.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Community Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Be part of a thriving business community that supports local growth and economic development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 