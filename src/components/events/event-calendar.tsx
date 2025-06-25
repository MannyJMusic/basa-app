'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock
} from 'lucide-react'
import { Event } from '@/lib/types'

interface EventCalendarProps {
  events: Event[]
  currentDate?: Date
  onDateSelect?: (date: Date) => void
  onEventClick?: (event: Event) => void
}

export function EventCalendar({ 
  events, 
  currentDate = new Date(),
  onDateSelect,
  onEventClick 
}: EventCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate)

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate)
        return eventDate.getDate() === currentDate.getDate() &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear()
      })
      
      days.push({
        date: new Date(currentDate),
        events: dayEvents,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString()
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [viewDate, events])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'NETWORKING': return 'bg-blue-100 text-blue-800'
      case 'SUMMIT': return 'bg-green-100 text-green-800'
      case 'RIBBON_CUTTING': return 'bg-orange-100 text-orange-800'
      case 'COMMUNITY': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setViewDate(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
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
              className={`min-h-[120px] p-2 border border-gray-200 transition-colors ${
                dayData.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${dayData.isToday ? 'ring-2 ring-purple-500' : ''} ${
                onDateSelect ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => onDateSelect?.(dayData.date)}
            >
              <div className={`text-sm font-medium mb-2 ${
                dayData.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${dayData.isToday ? 'text-purple-600 font-bold' : ''}`}>
                {dayData.date.getDate()}
              </div>
              
              {dayData.events.map((event, eventIndex) => (
                <div 
                  key={eventIndex}
                  className={`text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick?.(event)
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-75">{formatTime(event.startDate)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Event Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Event Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Networking</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Summit</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-100 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Ribbon Cutting</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-100 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Community</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 