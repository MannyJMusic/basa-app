'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Mail, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  ArrowRight,
  Download,
  Share2,
  Star,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

const MEMBERSHIP_TIERS = {
  essential: {
    name: 'Essential',
    price: 200,
    features: [
      'Access to monthly networking events',
      'Member directory access',
      '50% discount on event tickets',
      'Email newsletter subscription',
      'Basic business resources'
    ]
  },
  professional: {
    name: 'Professional',
    price: 400,
    features: [
      'All Essential benefits',
      'Priority event registration',
      'Featured listing in member directory',
      'Quarterly business spotlight opportunities',
      'Access to premium business resources',
      'Member referral program'
    ]
  },
  corporate: {
    name: 'Corporate Partnership',
    price: 750,
    features: [
      'All Professional benefits',
      'Dedicated account manager',
      'Ribbon cutting celebrations',
      'Speaking opportunities at events',
      'Corporate sponsorship opportunities',
      'Custom networking events',
      'Annual business showcase'
    ]
  }
}

const EVENT_DATA = {
  'monthly-mixer-2024': {
    title: 'BASA Monthly Mixer',
    date: '2024-02-15',
    time: '18:00',
    location: 'San Antonio Chamber of Commerce',
    address: '602 E Commerce St, San Antonio, TX 78205'
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const tier = searchParams.get('tier')
  const eventId = searchParams.get('eventId')
  const tickets = searchParams.get('tickets')
  const paymentId = searchParams.get('paymentId')
  
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // Send confirmation email (in real app, this would be handled by webhook)
    if (!emailSent) {
      setEmailSent(true)
      // Simulate email sending
      console.log('Sending confirmation email...')
    }
  }, [emailSent])

  const isMembership = type === 'membership'
  const isEvent = type === 'event'

  if (!type || !paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Confirmation</h1>
                <p className="text-gray-600 mb-6">
                  We couldn't find the payment details. Please contact support if you believe this is an error.
                </p>
                <Button asChild>
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600">
              {isMembership 
                ? 'Welcome to BASA! Your membership is now active.'
                : 'Your event registration is confirmed!'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confirmation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Confirmation Details
                </CardTitle>
                <CardDescription>
                  Your payment has been processed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-gray-900">{paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Membership Details */}
                {isMembership && tier && MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS] && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Membership Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Membership Tier:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS].name}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Annual Fee:</span>
                        <span className="font-semibold">
                          ${MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS].price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Valid Until:</span>
                        <span>
                          {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Details */}
                {isEvent && eventId && EVENT_DATA[eventId as keyof typeof EVENT_DATA] && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Event:</span>
                        <span className="font-semibold">
                          {EVENT_DATA[eventId as keyof typeof EVENT_DATA].title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tickets:</span>
                        <span className="font-semibold">{tickets}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>
                          {new Date(EVENT_DATA[eventId as keyof typeof EVENT_DATA].date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span>{EVENT_DATA[eventId as keyof typeof EVENT_DATA].time} PM</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
                <CardDescription>
                  Here's what you can expect and what to do next
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Confirmation */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Confirmation Email</h4>
                      <p className="text-sm text-gray-600">
                        We've sent a detailed confirmation email with all the information you need.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Membership Next Steps */}
                {isMembership && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Welcome to BASA!</h4>
                        <p className="text-sm text-gray-600">
                          Your membership is now active. You can access all member benefits immediately.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Your Benefits Include:</h5>
                      {tier && MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS] && (
                        <ul className="space-y-1">
                          {MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS].features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <Star className="w-3 h-3 text-yellow-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Event Next Steps */}
                {isEvent && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Event Confirmation</h4>
                        <p className="text-sm text-gray-600">
                          Your event registration is confirmed. We'll send you a reminder 24 hours before the event.
                        </p>
                      </div>
                    </div>
                    
                    {eventId && EVENT_DATA[eventId as keyof typeof EVENT_DATA] && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Event Location</h5>
                        <div className="space-y-1 text-sm text-blue-800">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {EVENT_DATA[eventId as keyof typeof EVENT_DATA].location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {EVENT_DATA[eventId as keyof typeof EVENT_DATA].time} PM
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Resources */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  We're here to help you get the most out of your BASA experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Have questions? Our team is here to help.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Member Resources</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Access exclusive business resources and tools.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/resources">View Resources</Link>
                    </Button>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Upcoming Events</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Discover networking opportunities and events.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 