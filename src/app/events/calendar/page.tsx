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
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"

export default function CalendarPage() {
  const { events, loading, fetchEvents } = useEvents()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<any[]>([])

  useEffect(() => {
    // Fetch published events
    fetchEvents({ status: "PUBLISHED" })
      .catch(error => {
        console.error('Error fetching events:', error)
      })
  }, [fetchEvents])

  useEffect(() => {
    // Generate calendar days for current month
    generateCalendarDays()
  }, [currentMonth, events])

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, events: [] })
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate)
        return eventDate.getDate() === day && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year
      })
      
      days.push({
        day,
        events: dayEvents.map(event => ({
          id: event.id,
          title: event.title,
          type: event.type.toLowerCase(),
          time: new Date(event.startDate).toLocaleTimeString(undefined, { 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          slug: event.slug
        }))
      })
    }
    
    setCalendarDays(days)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800'
      case 'ribbon_cutting': return 'bg-orange-100 text-orange-800'
      case 'summit': return 'bg-green-100 text-green-800'
      case 'community': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'NETWORKING': return 'bg-blue-100 text-blue-800'
      case 'RIBBON_CUTTING': return 'bg-orange-100 text-orange-800'
      case 'SUMMIT': return 'bg-green-100 text-green-800'
      case 'COMMUNITY': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Get events for the current month
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.startDate)
    return eventDate.getMonth() === currentMonth.getMonth() && 
           eventDate.getFullYear() === currentMonth.getFullYear()
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 mr-4">
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Calendar
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {formatMonthYear(currentMonth)} Event Calendar
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Plan your networking schedule with our comprehensive event calendar. 
              Never miss an opportunity to connect and grow your business.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Navigation */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {formatMonthYear(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{formatMonthYear(currentMonth)}</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              {formatMonthYear(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Calendar Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-lg">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => (
                <div 
                  key={index} 
                  className={`min-h-[120px] p-2 border border-gray-200 ${
                    dayData.day === null ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  {dayData.day && (
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {dayData.day}
                    </div>
                  )}
                  {dayData.events.map((event: any, eventIndex: number) => (
                    <Link 
                      key={eventIndex}
                      href={`/events/${event.slug}`}
                      className={`block text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.time}</div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Event Legend */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Networking Events</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Ribbon Cuttings</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Industry Summits</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Community Events</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Upcoming Events This Month
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading events...</p>
              </div>
            ) : currentMonthEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No events scheduled for {formatMonthYear(currentMonth)}.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentMonthEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getEventBadgeColor(event.type)}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(event.startDate).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.startDate).toLocaleTimeString(undefined, { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })} - {new Date(event.endDate).toLocaleTimeString(undefined, { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <CardTitle className="text-xl">
                        <Link 
                          href={`/events/${event.slug}`}
                          className="hover:text-purple-600 transition-colors duration-200"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {event.shortDescription || event.description?.slice(0, 150) + '...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          Capacity: {event.capacity || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 mr-2" />
                          Members: ${(Number(event.memberPrice) || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button asChild size="sm">
                          <Link href={`/events/${event.slug}/register`}>Register Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* View All Events CTA */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg" className="mr-4">
                <Link href="/events">View All Events</Link>
              </Button>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/events/list">Browse Event List</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Calendar Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Monthly View</h3>
                <p className="text-gray-600 text-sm">
                  Plan your networking schedule with our comprehensive monthly calendar view.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                <p className="text-gray-600 text-sm">
                  Click on any event to view detailed information, pricing, and registration options.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick Registration</h3>
                <p className="text-gray-600 text-sm">
                  Register for events directly from the calendar with just a few clicks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 