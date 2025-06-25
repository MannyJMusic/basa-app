'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Heart,
  Share2
} from 'lucide-react'
import { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  onFavorite?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

export function EventCard({ 
  event, 
  variant = 'default', 
  showActions = true,
  onFavorite,
  onShare 
}: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'NETWORKING': return 'bg-blue-100 text-blue-800'
      case 'SUMMIT': return 'bg-green-100 text-green-800'
      case 'RIBBON_CUTTING': return 'bg-orange-100 text-orange-800'
      case 'COMMUNITY': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'NETWORKING': return 'Networking'
      case 'SUMMIT': return 'Summit'
      case 'RIBBON_CUTTING': return 'Ribbon Cutting'
      case 'COMMUNITY': return 'Community'
      default: return type
    }
  }

  const confirmedRegistrations = event.registrations.filter(r => r.status === 'CONFIRMED').length
  const availableSpots = (event.capacity || 0) - confirmedRegistrations

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className={getEventTypeColor(event.type)}>
              {getEventTypeLabel(event.type)}
            </Badge>
            {event.isFeatured && (
              <Star className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <CardTitle className="text-lg mb-2">
            <Link href={`/events/${event.slug}`} className="hover:text-purple-600">
              {event.title}
            </Link>
          </CardTitle>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm">
              <span className="font-semibold text-green-600">
                ${event.memberPrice || event.price}
              </span>
            </div>
            <Button asChild size="sm">
              <Link href={`/events/${event.slug}/register`}>
                Register
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'featured') {
    return (
      <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Featured Event
            </Badge>
            {event.isFeatured && (
              <Star className="w-4 h-4 text-yellow-300" />
            )}
          </div>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription className="text-purple-100">
            {event.shortDescription || event.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                <span>{formatDate(event.startDate)} • {formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-3 text-purple-600" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-3 text-purple-600" />
                <span>{confirmedRegistrations}/{event.capacity} registered</span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Pricing</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">BASA Members:</span>
                  <span className="font-semibold text-green-700">${event.memberPrice} (Save 50%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Non-Members:</span>
                  <span className="font-semibold">${event.price}</span>
                </div>
              </div>
            </div>

            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href={`/events/${event.slug}/register`}>
                Register Now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getEventTypeColor(event.type)}>
            {getEventTypeLabel(event.type)}
          </Badge>
          <div className="flex items-center space-x-1">
            {event.isFeatured && (
              <Star className="w-4 h-4 text-yellow-500" />
            )}
            {showActions && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onFavorite?.(event.id)}
                  className="h-8 w-8 p-0"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onShare?.(event.id)}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">
          <Link href={`/events/${event.slug}`} className="hover:text-purple-600">
            {event.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {event.shortDescription || event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          {event.capacity && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{confirmedRegistrations}/{event.capacity} registered</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <span className="font-semibold text-green-600">
                ${event.memberPrice || event.price}
              </span>
              {event.memberPrice && event.price && (
                <span className="text-gray-500 ml-1">
                  / ${event.price} non-member
                </span>
              )}
            </div>
            <Button asChild size="sm">
              <Link href={`/events/${event.slug}/register`}>
                Register
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 