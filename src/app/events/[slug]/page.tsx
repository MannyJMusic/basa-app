'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star } from 'lucide-react'

export default function EventDetailPage() {
  const params = useParams()
  const eventSlug = params.slug as string

  // Mock event data
  const event = {
    title: 'BASA Monthly Networking Mixer',
    description: 'Connect with fellow business owners in a relaxed, professional setting.',
    startDate: new Date('2024-03-21T18:00:00'),
    endDate: new Date('2024-03-21T21:00:00'),
    location: 'San Antonio Marriott Rivercenter',
    price: 50,
    memberPrice: 25,
    capacity: 150,
    registrations: 67,
    type: 'NETWORKING'
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              Networking Event
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed mb-6">
              {event.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Register for Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">BASA Members:</span>
                      <span className="font-semibold text-green-600">${event.memberPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Non-Members:</span>
                      <span className="font-semibold">${event.price}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/events/${eventSlug}/register`}>
                      Register Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 