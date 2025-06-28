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
  AlertCircle,
  UserPlus,
  Send
} from 'lucide-react'
import Link from 'next/link'

interface CartItem {
  tierId: string
  quantity: number
  price: number
  name: string
}

interface AdditionalMember {
  id: string
  name: string
  email: string
  tierId: string
  sendInvitation: boolean
}

interface CheckoutData {
  cart: CartItem[]
  additionalMembers: AdditionalMember[]
  total: number
}

const MEMBERSHIP_TIERS = {
  // Chapter Memberships
  'meeting-member': {
    name: 'Meeting Member',
    price: 149,
    features: [
      'Special Rates at BASA Networking Events for 1 Employee',
      'Directory Listing on the BASA Website',
      'Receive a New Member Bundle Bag',
      'Opportunity to provide Marketing Materials for the Bundle Bag',
      'Access to the BASA Private Facebook Page',
      'Receive BASA Benefits from fellow members',
      'Opportunity to provide a BASA Benefit to your fellow members',
      'Membership Certificate'
    ]
  },
  'associate-member': {
    name: 'Associate Member',
    price: 245,
    features: [
      'Special Rates at BASA Networking Events for 2 Employees',
      'Directory Listing on the BASA Website',
      'Receive a New Member Bundle Bag',
      'Opportunity to provide Marketing Materials for the Bundle Bag',
      'Access to the BASA Private Facebook Page',
      '2 shared E-Blasts per month (content provided by member)',
      '1 social media post per month (content provided by member)',
      '1 video post on social media per month (content provided by member)',
      'Receive BASA Benefits from fellow members',
      'Opportunity to provide a BASA Benefit to your fellow members',
      'Membership Certificate'
    ]
  },
  'trio-member': {
    name: 'TRIO Member',
    price: 295,
    features: [
      'Membership in ALL THREE CHAPTERS',
      'Special Rates at BASA Networking Events for 1 Employee',
      'Directory Listing on the BASA Website',
      'Receive a New Member Bundle Bag',
      'Access to the BASA Private Facebook Page',
      'Opportunity to provide Marketing Materials for the Bundle Bag',
      'Receive BASA Benefits from fellow members',
      'Opportunity to provide a BASA Benefit to your fellow members',
      'Membership Certificate'
    ]
  },
  // Resource Memberships
  'class-resource-member': {
    name: 'Class Resource Member',
    price: 120,
    features: [
      'Special rates for one at monthly training class',
      'Directory listing on the BASA Resource Page',
      'Access to BASA Resource Website & Private Facebook Page',
      'Bundle Bag - provide marketing materials',
      'Receive a BASA Bundle Bag',
      'Receive BASA Benefits from fellow BASA Members',
      'Provide a BASA Benefit to fellow BASA Members',
      'Welcome post on social media outlets'
    ]
  },
  'nag-resource-member': {
    name: 'NAG Resource Member',
    price: 0,
    features: [
      'As a Networking & Giving NAG Member, the benefits of a Resource Member are included.'
    ]
  },
  'training-resource-member': {
    name: 'Training Resource Member',
    price: 225,
    features: [
      'Guaranteed seat for one at monthly training class',
      'Special rate for additional attendees to training classes',
      'Opportunity to be a trainer/panelist within the year',
      'Directory listing on the BASA Resource Page',
      'Access to BASA Resource Website & Private Facebook Page',
      'Bundle Bag - provide marketing materials',
      'Receive a BASA Bundle Bag',
      'Receive BASA Benefits from fellow BASA Members',
      'Provide a BASA Benefit to fellow BASA Members',
      'Welcome post on social media outlets'
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
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  
  const type = searchParams.get('type')
  const paymentId = searchParams.get('paymentId')
  const eventId = searchParams.get('eventId')
  const cartParam = searchParams.get('cart')

  useEffect(() => {
    if (cartParam) {
      try {
        const parsed = JSON.parse(cartParam) as CheckoutData
        setCheckoutData(parsed)
      } catch (err) {
        console.error('Failed to parse cart data:', err)
      }
    }
  }, [cartParam])

  const isMembership = type === 'membership'
  const isEvent = type === 'event'
  const totalMemberships = checkoutData?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0
  const hasMultipleMemberships = totalMemberships > 1

  if (!type || !paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment</h1>
          <p className="text-gray-600">Unable to verify payment information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            <p className="text-sm text-gray-500">
              Payment ID: {paymentId}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span>Credit Card</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                
                {isMembership && checkoutData && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold">${checkoutData.total.toFixed(2)}</span>
                  </div>
                )}

                {isEvent && eventId && EVENT_DATA[eventId as keyof typeof EVENT_DATA] && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Event Price</span>
                    <span className="font-semibold">$25.00</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Membership Details */}
            {isMembership && checkoutData && (
              <Card>
                <CardHeader>
                  <CardTitle>Membership Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Purchased Memberships:</h3>
                    {checkoutData.cart.map((item) => {
                      const tier = MEMBERSHIP_TIERS[item.tierId as keyof typeof MEMBERSHIP_TIERS]
                      return (
                        <div key={item.tierId} className="border-b border-gray-200 pb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{tier.name}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Qty: {item.quantity}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Annual Fee</span>
                            <span className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valid Until</span>
                      <span>
                        {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Additional Members */}
                  {checkoutData.additionalMembers.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Additional Members ({checkoutData.additionalMembers.length})
                        </h4>
                        {checkoutData.additionalMembers.map((member, index) => (
                          <div key={member.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{member.name}</span>
                              {member.sendInvitation && (
                                <Send className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            {member.sendInvitation && (
                              <p className="text-xs text-blue-600 mt-1">
                                Invitation email sent
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            {isEvent && eventId && EVENT_DATA[eventId as keyof typeof EVENT_DATA] && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Event Date</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(EVENT_DATA[eventId as keyof typeof EVENT_DATA].date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Time</h4>
                        <p className="text-sm text-gray-600">
                          {EVENT_DATA[eventId as keyof typeof EVENT_DATA].time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Location</h4>
                        <p className="text-sm text-gray-600">
                          {EVENT_DATA[eventId as keyof typeof EVENT_DATA].location}
                        </p>
                        <p className="text-sm text-gray-500">
                          {EVENT_DATA[eventId as keyof typeof EVENT_DATA].address}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {checkoutData?.cart.slice(0, 1).map((item) => {
                        const tier = MEMBERSHIP_TIERS[item.tierId as keyof typeof MEMBERSHIP_TIERS]
                        return (
                          <ul key={item.tierId} className="space-y-1">
                            {tier.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                <Star className="w-3 h-3 text-yellow-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )
                      })}
                    </div>

                    {hasMultipleMemberships && (
                      <div className="flex items-center">
                        <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Additional Members</h4>
                          <p className="text-sm text-gray-600">
                            Invitation emails have been sent to additional members. They'll receive instructions to activate their accounts.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isEvent && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Event Confirmation</h4>
                        <p className="text-sm text-gray-600">
                          You're all set for the event! We'll send you a reminder email closer to the date.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/events">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Events
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/membership">
                        <Users className="w-4 h-4 mr-2" />
                        Membership Info
                      </Link>
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