'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star } from 'lucide-react'

export default function EventRegistrationPage() {
  const router = useRouter()

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
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Registration
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Register for Event
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Complete your registration for {event.title}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Registration</h3>
            <p className="text-gray-600 mb-6">
              This page will handle event registration with payment processing.
            </p>
            
            <Card className="max-w-md mx-auto mb-6">
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>Event Details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{event.registrations}/{event.capacity} registered</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">BASA Members:</span>
                    <span className="font-semibold text-green-600">${event.memberPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Non-Members:</span>
                    <span className="font-semibold">${event.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-x-4">
              <Button asChild variant="outline">
                <Link href="/events">Back to Events</Link>
              </Button>
              <Button asChild>
                <Link href="/events/basa-monthly-mixer/register">
                  Continue to Registration
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 