'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Gift, 
  CheckCircle, 
  Mail, 
  Users, 
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  Handshake,
  Building2,
  Target
} from 'lucide-react'
import Link from 'next/link'

const UPCOMING_EVENTS = [
  {
    id: 'monthly-mixer-feb',
    title: 'BASA Monthly Mixer',
    date: 'February 15, 2024',
    time: '6:00 PM - 8:00 PM',
    location: 'San Antonio Chamber of Commerce',
    address: '602 E Commerce St, San Antonio, TX 78205',
    capacity: 100,
    registered: 67,
    description: 'Connect with fellow business owners in a relaxed, professional setting. Network, share ideas, and build meaningful relationships.',
    features: [
      'Professional networking opportunities',
      'Light refreshments included',
      'Business card exchange',
      'Guest speaker presentation',
      'Door prizes and giveaways'
    ]
  },
  {
    id: 'networking-workshop-mar',
    title: 'Strategic Networking Workshop',
    date: 'March 8, 2024',
    time: '9:00 AM - 12:00 PM',
    location: 'BASA Conference Center',
    address: '123 Business Blvd, San Antonio, TX 78205',
    capacity: 50,
    registered: 23,
    description: 'Learn advanced networking strategies and techniques to maximize your business connections and opportunities.',
    features: [
      'Interactive workshop format',
      'Networking strategy training',
      'Role-playing exercises',
      'Take-home materials',
      'Follow-up coaching session'
    ]
  },
  {
    id: 'industry-summit-apr',
    title: 'San Antonio Industry Summit',
    date: 'April 12, 2024',
    time: '8:00 AM - 5:00 PM',
    location: 'Henry B. González Convention Center',
    address: '900 E Market St, San Antonio, TX 78205',
    capacity: 200,
    registered: 145,
    description: 'Join industry leaders for a day of insights, networking, and collaboration opportunities across San Antonio\'s key business sectors.',
    features: [
      'Keynote presentations',
      'Industry breakout sessions',
      'Networking lunch',
      'Exhibition hall access',
      'Evening networking reception'
    ]
  }
]

export default function GuestPassRequestPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    selectedEvent: '',
    agreeToTerms: false,
    subscribeToNewsletter: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.selectedEvent || !formData.agreeToTerms) {
      setError('Please fill in all required fields and agree to the terms.')
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, this would send the data to your backend
      console.log('Guest pass request submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to process your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedEvent = UPCOMING_EVENTS.find(event => event.id === formData.selectedEvent)

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Guest Pass Request Submitted!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Thank you for your interest in BASA. We'll review your request and send you confirmation within 24 hours.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• We'll review your request within 24 hours</li>
                      <li>• You'll receive a confirmation email with event details</li>
                      <li>• Your name will be added to the guest list</li>
                      <li>• Check your email for additional event information</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/events">Browse All Events</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/membership/join">Join BASA Today</Link>
                  </Button>
                </div>
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
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/resources" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Request Your Free Guest Pass
            </h1>
            <p className="text-xl text-gray-600">
              Experience BASA firsthand with a complimentary event ticket
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Request Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  Request Guest Pass
                </CardTitle>
                <CardDescription>
                  Fill out the form below to request your complimentary event ticket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Enter your company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position/Title</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder="Enter your position"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event">Select Event *</Label>
                    <Select
                      value={formData.selectedEvent}
                      onValueChange={(value) => handleInputChange('selectedEvent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event to attend" />
                      </SelectTrigger>
                      <SelectContent>
                        {UPCOMING_EVENTS.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title} - {event.date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="subscribeToNewsletter"
                        checked={formData.subscribeToNewsletter}
                        onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked as boolean)}
                      />
                      <Label htmlFor="subscribeToNewsletter" className="text-sm">
                        Subscribe to our weekly market insights newsletter
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        required
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm">
                        I agree to attend the selected event and receive communications from BASA. 
                        I understand this is a one-time guest pass offer.
                      </Label>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Calendar className="w-4 h-4 mr-2 animate-pulse" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Request Free Guest Pass
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Event Details */}
            <div className="space-y-6">
              {selectedEvent ? (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Event Details
                    </CardTitle>
                    <CardDescription>
                      Information about your selected event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{selectedEvent.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{selectedEvent.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                        <span>{selectedEvent.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <span>{selectedEvent.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                        <span>{selectedEvent.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 text-blue-600 mr-2" />
                        <span>{selectedEvent.registered}/{selectedEvent.capacity} registered</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">What's Included:</h4>
                      <ul className="space-y-1">
                        {selectedEvent.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Select an Event</CardTitle>
                    <CardDescription>
                      Choose an event from the dropdown to see details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Once you select an event, you'll see detailed information about the venue, 
                      schedule, and what's included with your guest pass.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Guest Pass Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Free event attendance (no cost)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Network with 150+ BASA members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Experience BASA's networking culture</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>No obligation to join</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Special guest pricing if you decide to join</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 