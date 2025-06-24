'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Award,
  Building2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const MEMBERSHIP_TIERS = {
  essential: {
    name: 'Essential',
    price: 200,
    description: 'Perfect for small businesses and startups',
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
    description: 'Ideal for growing businesses',
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
    description: 'For established businesses seeking maximum exposure',
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

export default function MembershipPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTier = searchParams.get('tier') as keyof typeof MEMBERSHIP_TIERS || 'essential'
  
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRenew, setAutoRenew] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  })

  const tier = MEMBERSHIP_TIERS[selectedTier]

  useEffect(() => {
    if (!selectedTier || !MEMBERSHIP_TIERS[selectedTier]) {
      router.push('/membership/join')
      return
    }
  }, [selectedTier, router])

  const createPaymentIntent = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          customerInfo,
          autoRenew,
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
    router.push(`/payment/success?type=membership&tier=${selectedTier}&paymentId=${paymentIntentId}`)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/membership/join" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Membership Options
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Secure Online Payment - Start Your BASA Journey Today
              </h1>
              <p className="text-xl text-gray-600">
                Complete your {tier.name} membership registration
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Enter your details to complete the payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          value={customerInfo.company}
                          onChange={(e) => handleCustomerInfoChange('company', e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Auto-renewal Option */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoRenew"
                        checked={autoRenew}
                        onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                      />
                      <Label htmlFor="autoRenew" className="text-sm">
                        Enable automatic renewal
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your membership will automatically renew annually. You can cancel anytime.
                    </p>
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
                    disabled={loading || !customerInfo.name || !customerInfo.email}
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

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Your {tier.name} membership details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Membership Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tier.name} Membership</h3>
                        <p className="text-sm text-gray-600">{tier.description}</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {selectedTier}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Membership</span>
                      <span className="font-semibold">${tier.price}</span>
                    </div>
                    {autoRenew && (
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Auto-renewal enabled</span>
                        <span>Free</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>${tier.price}</span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Secure Payment</p>
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
              Complete Your Payment
            </h1>
            <p className="text-xl text-gray-600">
              Secure payment for {tier.name} membership
            </p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeForm
              clientSecret={clientSecret}
              amount={tier.price * 100}
              description={`${tier.name} Membership - Annual`}
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