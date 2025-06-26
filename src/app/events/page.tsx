'use client'

import Link from "next/link"
import { useEffect } from "react"
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
  Search
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"

export default function EventsPage() {
  const { events, loading, fetchEvents } = useEvents()

  useEffect(() => {
    console.log('EventsPage: useEffect triggered')
    // Fetch only published and upcoming events
    fetchEvents({ status: "PUBLISHED" }, 1, 20, "startDate", "asc")
      .then(data => {
        console.log('EventsPage: fetchEvents success', data)
      })
      .catch(error => {
        console.error('EventsPage: fetchEvents error', error)
      })
  }, [fetchEvents])

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
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Calendar
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Connect at San Antonio's Premier Business Events
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Join BASA's curated networking events designed to accelerate your business growth, 
              build meaningful connections, and stay ahead of industry trends.
            </p>
          </div>
        </div>
      </section>

      {/* Event Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">12+</div>
              <div className="text-sm text-gray-600">Events Monthly</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">150+</div>
              <div className="text-sm text-gray-600">Attendees Per Event</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">50%</div>
              <div className="text-sm text-gray-600">Member Discount</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  placeholder="Search events..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>
              <Button variant="outline" className="flex items-center" disabled>
                <Filter className="w-4 h-4 mr-2" />
                Filter Events
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/events/calendar">View Calendar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't miss these exclusive networking opportunities designed to accelerate your business success.
            </p>
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events
                // Temporarily remove date filtering to debug
                // .filter(event => {
                //   const isFuture = new Date(event.endDate) >= new Date()
                //   console.log(`Event ${event.title}: endDate=${event.endDate}, isFuture=${isFuture}`)
                //   return isFuture
                // })
                .map(event => (
                  <Card key={event.id} className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        {event.isFeatured && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Featured Event
                          </Badge>
                        )}
                        <div className="text-sm opacity-90">
                          {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <CardTitle className="text-2xl">
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
          )}
        </div>
      </section>

      {/* Event Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Attend BASA Events?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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