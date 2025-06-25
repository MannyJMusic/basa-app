'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Share2,
  Heart,
  Building2,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  User,
  Award
} from 'lucide-react'
import { Event } from '@/lib/types'

interface EventDetailProps {
  event: Event
  showActions?: boolean
  onFavorite?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

export function EventDetail({ 
  event, 
  showActions = true,
  onFavorite,
  onShare 
}: EventDetailProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      case 'NETWORKING': return 'Networking Event'
      case 'SUMMIT': return 'Industry Summit'
      case 'RIBBON_CUTTING': return 'Ribbon Cutting'
      case 'COMMUNITY': return 'Community Event'
      default: return type
    }
  }

  const confirmedRegistrations = event.registrations.filter(r => r.status === 'CONFIRMED').length

  return (
    <div className="space-y-8">
      {/* Event Description */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getEventTypeColor(event.type)}>
                  {getEventTypeLabel(event.type)}
                </Badge>
                {event.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            {showActions && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onFavorite?.(event.id)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onShare?.(event.id)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <CardDescription className="text-lg">
            {event.shortDescription || event.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-6">
            {event.description}
          </p>
          
          {/* Event Features */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Professional networking opportunities</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Light refreshments included</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Business card exchange</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Guest speaker presentations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 text-gray-500 mr-3" />
              <div>
                <p className="font-medium">{formatDate(event.startDate)}</p>
                <p className="text-gray-600">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
              </div>
            </div>
            
            <div className="flex items-start text-sm">
              <MapPin className="w-4 h-4 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium">{event.location}</p>
                {event.address && (
                  <p className="text-gray-600">{event.address}</p>
                )}
                <p className="text-gray-600">{event.city}, {event.state} {event.zipCode}</p>
              </div>
            </div>

            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 text-gray-500 mr-3" />
              <div>
                <p className="font-medium">{event.category}</p>
                <p className="text-gray-600">All industries welcome</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Tags */}
      {event.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 