'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  DollarSign,
  ArrowRight,
  Grid3X3,
  List,
  CalendarDays,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react"

interface Event {
  id: string
  title: string
  description?: string
  shortDescription?: string
  slug: string
  startDate: string
  endDate: string
  location: string
  capacity?: number
  category: string
  type?: string
  isFeatured?: boolean
  price?: number
  memberPrice?: number
  status?: string
}

interface EventsDisplayProps {
  events: Event[]
  loading: boolean
  title?: string
  emptyMessage?: string
  viewMode?: ViewMode
  setViewMode?: (mode: ViewMode) => void
  searchTerm?: string
  setSearchTerm?: (term: string) => void
  eventType?: string
  setEventType?: (type: string) => void
  selectedCategory?: string | null
}

type ViewMode = 'grid' | 'list' | 'calendar'

export function EventsDisplay({ 
  events, 
  loading, 
  title = "Events",
  emptyMessage = "No events found.",
  viewMode = 'grid',
  setViewMode,
  searchTerm = "",
  setSearchTerm,
  eventType = "all",
  setEventType,
  selectedCategory = null
}: EventsDisplayProps) {
  const { data: session } = useSession()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<any[]>([])
  const isGuest = session?.user?.role === "GUEST"

  // Use internal state if setViewMode is not provided
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid')
  const currentViewMode = setViewMode ? viewMode : internalViewMode
  const updateViewMode = setViewMode || setInternalViewMode

  // Filter events based on search, filters, and selected category
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = eventType === "all" || 
      event.category?.toLowerCase() === eventType.toLowerCase()
    
    const matchesCategory = !selectedCategory || 
      event.category?.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesType && matchesCategory
  })

  useEffect(() => {
    if (currentViewMode === 'calendar') {
      generateCalendarDays()
    }
  }, [currentMonth, events, searchTerm, eventType, selectedCategory, currentViewMode])

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || days.length < 42) {
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.startDate)
        return eventDate.getDate() === currentDate.getDate() &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear()
      })
      
      days.push({
        day: currentDate.getMonth() === month ? currentDate.getDate() : null,
        events: dayEvents.map(event => ({
          id: event.id,
          title: event.title,
          time: new Date(event.startDate).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          type: event.category?.toLowerCase() || 'other',
          slug: event.slug,
          memberPrice: event.memberPrice
        }))
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    setCalendarDays(days)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800'
      case 'ribbon_cutting': return 'bg-orange-100 text-orange-800'
      case 'summit': return 'bg-green-100 text-green-800'
      case 'community': return 'bg-red-100 text-red-800'
      case 'educational': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-pink-100 text-pink-800'
      case 'charity': return 'bg-yellow-100 text-yellow-800'
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex space-x-2">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-center py-8">Loading events...</div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex space-x-2">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      </div>
    )
  }

  const renderEventCard = (event: Event) => (
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
        {isGuest ? (
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
            {!isGuest && (
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
  )

  const renderListView = () => (
    <div className="space-y-4">
      {filteredEvents.map(event => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {event.category}
                  </Badge>
                  {event.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-3">
                  {event.shortDescription || event.description?.slice(0, 150) + '...'}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Capacity: {event.capacity || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-3 ml-6">
                {/* Pricing */}
                {isGuest ? (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Price:</p>
                    <p className="text-lg font-semibold text-blue-700">
                      ${(Number(event.price) || 0).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Member Price:</p>
                    <p className="text-lg font-semibold text-green-700">
                      ${(Number(event.memberPrice) || 0).toFixed(2)}
                    </p>
                    {!isGuest && (
                      <p className="text-xs text-gray-500 line-through">
                        ${(Number(event.price) || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/events/${event.slug}`}>View Details</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/events/${event.slug}/register`}>
                      <Ticket className="w-4 h-4 mr-1" />
                      Register
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderCalendarView = () => (
    <div className="space-y-6">
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
            <h3 className="text-xl font-bold text-gray-900">{formatMonthYear(currentMonth)}</h3>
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
                          {!isGuest && event.memberPrice && (
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
    </div>
  )

  return (
    <div className="space-y-6">
      {!setViewMode && (
        <div className="flex items-center justify-end">
          <div className="flex space-x-2">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {currentViewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(renderEventCard)}
        </div>
      )}

      {currentViewMode === 'list' && renderListView()}

      {currentViewMode === 'calendar' && renderCalendarView()}
    </div>
  )
} 