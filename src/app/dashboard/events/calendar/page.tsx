'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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
  ArrowLeft,
  Crown,
  Ticket,
  DollarSign
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"

export default function MemberCalendarPage() {
  const { data: session } = useSession()
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
          slug: event.slug,
          memberPrice: event.memberPrice,
          price: event.price
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

  // Check if user is a member
  const isMember = session?.user?.role === "MEMBER"

  // Get events for the current month
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.startDate)
    return eventDate.getMonth() === currentMonth.getMonth() && 
           eventDate.getFullYear() === currentMonth.getFullYear()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
            <p className="text-gray-600 mt-1">Plan your networking schedule and register for events</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline">
            <Link href="/events/calendar">Public Calendar</Link>
          </Button>
          <Button asChild>
            <Link href="/events">Browse All Events</Link>
          </Button>
        </div>
      </div>

      {/* Member Benefits Banner */}
      {isMember && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-yellow-300" />
                <div>
                  <h3 className="font-semibold">Member Calendar View</h3>
                  <p className="text-blue-100 text-sm">Click on any event to register with member pricing</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                50% Off Events
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
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
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
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
                  dayData.day ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {dayData.day && (
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {dayData.day}
                    </div>
                    <div className="space-y-1">
                      {dayData.events.map((event: any) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event.type)}`}
                          onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">{event.time}</div>
                          {isMember && event.memberPrice && (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs">Member:</span>
                              <span className="text-xs font-medium">${event.memberPrice}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Events This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Upcoming Events - {formatMonthYear(currentMonth)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : currentMonthEvents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No events this month</div>
            ) : (
              <div className="space-y-3">
                {currentMonthEvents
                  .filter(event => new Date(event.endDate) >= new Date())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-600">
                          {new Date(event.startDate).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isMember && event.memberPrice && (
                          <div className="text-right">
                            <div className="text-xs text-green-600 font-medium">
                              ${event.memberPrice}
                            </div>
                            <div className="text-xs text-gray-400 line-through">
                              ${event.price}
                            </div>
                          </div>
                        )}
                        <Button size="sm" asChild>
                          <Link href={`/events/${event.slug}/register`}>
                            <Ticket className="w-3 h-3 mr-1" />
                            Register
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Events:</span>
                <span className="font-semibold">{currentMonthEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Upcoming Events:</span>
                <span className="font-semibold text-blue-600">
                  {currentMonthEvents.filter(event => new Date(event.endDate) >= new Date()).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Past Events:</span>
                <span className="font-semibold text-gray-600">
                  {currentMonthEvents.filter(event => new Date(event.endDate) < new Date()).length}
                </span>
              </div>
              {isMember && (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Member discounts available</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Categories Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Event Categories</CardTitle>
          <CardDescription>Understanding the different types of events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-sm">Networking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 rounded"></div>
              <span className="text-sm">Ribbon Cutting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm">Summit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-sm">Community</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 