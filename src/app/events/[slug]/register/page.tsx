'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { StripeForm } from '@/components/payments/stripe-form'
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  RefreshCw,
  Plus,
  Minus,
  Ticket,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useEvents } from '@/hooks/use-events'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AttendeeInfo {
  name: string
  email: string
  company: string
  phone: string
}

export default function EventRegistrationPage() {
  const router = useRouter()
  const params = useParams()
  const eventSlug = params.slug as string
  
  const [event, setEvent] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketCount, setTicketCount] = useState(1)
  const [isMember, setIsMember] = useState(false)
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([
    { name: '', email: '', company: '', phone: '' }
  ])

  useEffect(() => {
    async function loadEvent() {
      setLoading(true)
      setError(null)
      try {
        // Fetch event by slug from API
        const res = await fetch(`/api/events?search=${eventSlug}`)
        const data = await res.json()
        // Find exact match by slug
        const found = data.events?.find((e: any) => e.slug === eventSlug)
        if (found) {
          setEvent(found)
        } else {
          setError('Event not found')
        }
      } catch (err) {
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [eventSlug])

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading event...</h1>
            {error && <p className="text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  const availableSpots = event.capacity - (event.registrations?.length || 0)

  // Calculate pricing with group discounts
  const calculatePricing = () => {
    const basePrice = isMember ? event.memberPrice : event.price
    let totalPrice = basePrice * ticketCount
    let discount = 0
    let discountPercentage = 0

    // Apply 15% group discount for 3+ tickets
    if (ticketCount >= 3) {
      discount = totalPrice * 0.15
      totalPrice = totalPrice - discount
      discountPercentage = 15
    }

    return {
      pricePerTicket: basePrice,
      totalPrice,
      discount,
      discountPercentage
    }
  }

  const pricing = calculatePricing()

  const createPaymentIntent = async () => {
    setLoading(true)
    setError(null)

    // Validate attendee information
    const validAttendees = attendees.slice(0, ticketCount)
    const hasInvalidAttendee = validAttendees.some(attendee => !attendee.name || !attendee.email)
    
    if (hasInvalidAttendee) {
      setError('Please fill in all required attendee information')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/payments/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          ticketCount,
          isMember,
          attendeeInfo: {
            name: attendees[0].name,
            email: attendees[0].email,
            attendeeNames: validAttendees.map(a => a.name)
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment setup failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    router.push(`/payment/success?type=event&eventId=${event.id}&tickets=${ticketCount}&paymentId=${paymentIntentId}`)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const updateAttendee = (index: number, field: keyof AttendeeInfo, value: string) => {
    const newAttendees = [...attendees]
    newAttendees[index] = { ...newAttendees[index], [field]: value }
    setAttendees(newAttendees)
  }

  const addAttendee = () => {
    if (ticketCount < availableSpots) {
      setTicketCount(prev => prev + 1)
      setAttendees(prev => [...prev, { name: '', email: '', company: '', phone: '' }])
    }
  }

  const removeAttendee = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1)
      setAttendees(prev => prev.slice(0, -1))
    }
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href={`/events/${eventSlug}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event Details
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Easy Registration & Payment - Reserve Your Networking Opportunity
              </h1>
              <p className="text-xl text-gray-600">
                Complete your registration for {event.title}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Registration Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ticket className="w-5 h-5 mr-2" />
                    Event Registration
                  </CardTitle>
                  <CardDescription>
                    Enter attendee information and payment details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ticket Count */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Number of Tickets</h3>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeAttendee}
                        disabled={ticketCount <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-xl font-semibold w-12 text-center">{ticketCount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addAttendee}
                        disabled={ticketCount >= availableSpots}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {availableSpots - ticketCount} spots remaining
                      </span>
                    </div>
                    {ticketCount >= 3 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center text-green-800">
                          <Star className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Group discount applied! Save 15% on 3+ tickets</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Member Status */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Membership Status</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isMember"
                        checked={isMember}
                        onChange={(e) => setIsMember(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isMember" className="text-sm">
                        I am a BASA member (receive member pricing)
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Members pay ${event.memberPrice} per ticket, non-members pay ${event.price}
                    </p>
                  </div>

                  <Separator />

                  {/* Attendee Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Attendee Information</h3>
                    {attendees.slice(0, ticketCount).map((attendee, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-medium text-gray-900">
                          Attendee {index + 1} {index === 0 && '(Primary Contact)'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`name-${index}`}>Full Name *</Label>
                            <Input
                              id={`name-${index}`}
                              value={attendee.name}
                              onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                              placeholder="Enter full name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-${index}`}>Email Address *</Label>
                            <Input
                              id={`email-${index}`}
                              type="email"
                              value={attendee.email}
                              onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                              placeholder="Enter email address"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`company-${index}`}>Company</Label>
                            <Input
                              id={`company-${index}`}
                              value={attendee.company}
                              onChange={(e) => updateAttendee(index, 'company', e.target.value)}
                              placeholder="Enter company name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phone-${index}`}>Phone</Label>
                            <Input
                              id={`phone-${index}`}
                              value={attendee.phone}
                              onChange={(e) => updateAttendee(index, 'phone', e.target.value)}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={createPaymentIntent}
                    disabled={loading || availableSpots < ticketCount}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Setting up payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Continue to Secure Payment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Event Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Summary</CardTitle>
                  <CardDescription>Event details and pricing breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{event.time} PM</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {/* Speaker Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Featured Speaker</h4>
                      <p className="text-sm text-blue-800 font-medium">{event.speaker.name}</p>
                      <p className="text-sm text-blue-700">{event.speaker.title}</p>
                      <p className="text-sm text-blue-600 mt-1">"{event.speaker.topic}"</p>
                    </div>

                    {/* Event Features */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">What's Included</h4>
                      {event.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Pricing Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Price per ticket ({isMember ? 'Member' : 'Non-Member'})</span>
                        <span>${pricing.pricePerTicket}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Quantity</span>
                        <span>× {ticketCount}</span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Group discount ({pricing.discountPercentage}%)</span>
                          <span>-${pricing.discount}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>${pricing.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Secure Registration</p>
                        <p>Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.</p>
                      </div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Your Registration
            </h1>
            <p className="text-xl text-gray-600">
              Secure payment for {event.title}
            </p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeForm
              clientSecret={clientSecret}
              amount={pricing.totalPrice * 100}
              description={`${event.title} - ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              loading={loading}
            />
          </Elements>
        </div>
      </div>
    </div>
  )
} 