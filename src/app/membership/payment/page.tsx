'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle,
  UserPlus,
  Send,
  Users
} from 'lucide-react'
import StripeForm from '@/components/payments/stripe-form'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
    description: 'Perfect for new members starting their networking journey',
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
    description: 'Most popular choice for growing businesses',
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
    description: 'Access to all three chapters for maximum networking',
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
    description: 'Access to training classes and resource benefits',
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
    description: 'Best value - Networking & Giving membership',
    features: [
      'As a Networking & Giving NAG Member, the benefits of a Resource Member are included.'
    ]
  },
  'training-resource-member': {
    name: 'Training Resource Member',
    price: 225,
    description: 'Guaranteed training access and trainer opportunities',
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

export default function MembershipPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
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

  // Parse cart data from URL
  useEffect(() => {
    const cartParam = searchParams.get('cart')
    if (cartParam) {
      try {
        const parsed = JSON.parse(cartParam) as CheckoutData
        setCheckoutData(parsed)
      } catch (err) {
        console.error('Failed to parse cart data:', err)
        router.push('/membership/join')
      }
    } else {
      router.push('/membership/join')
    }
  }, [searchParams, router])

  const createPaymentIntent = async () => {
    if (!checkoutData) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: checkoutData.cart,
          additionalMembers: checkoutData.additionalMembers,
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
    const params = new URLSearchParams()
    params.append('type', 'membership')
    params.append('paymentId', paymentIntentId)
    params.append('cart', JSON.stringify(checkoutData))
    router.push(`/payment/success?${params.toString()}`)
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

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    )
  }

  const totalMemberships = checkoutData.cart.reduce((sum, item) => sum + item.quantity, 0)
  const hasMultipleMemberships = totalMemberships > 1

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
                Secure Online Payment - Complete Your BASA Registration
              </h1>
              <p className="text-xl text-gray-600">
                {totalMemberships} membership{totalMemberships !== 1 ? 's' : ''} selected
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
                        id="auto-renew"
                        checked={autoRenew}
                        onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                      />
                      <Label htmlFor="auto-renew" className="text-sm">
                        Enable automatic renewal for annual membership
                      </Label>
                    </div>
                    <p className="text-xs text-gray-600">
                      Your membership will automatically renew each year. You can cancel anytime.
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Payment Button */}
                  <Button
                    onClick={createPaymentIntent}
                    disabled={loading || !customerInfo.name || !customerInfo.email}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ${checkoutData.total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Your membership details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Membership Details */}
                  <div className="space-y-4">
                    {checkoutData.cart.map((item) => {
                      const tier = MEMBERSHIP_TIERS[item.tierId as keyof typeof MEMBERSHIP_TIERS]
                      return (
                        <div key={item.tierId} className="border-b border-gray-200 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                              <p className="text-sm text-gray-600">{tier.description}</p>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Qty: {item.quantity}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {tier.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                            {tier.features.length > 3 && (
                              <div className="text-sm text-blue-600">
                                +{tier.features.length - 3} more benefits
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  {/* Additional Members */}
                  {checkoutData.additionalMembers.length > 0 && (
                    <>
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
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Pricing */}
                  <div className="space-y-2">
                    {checkoutData.cart.map((item) => (
                      <div key={item.tierId} className="flex justify-between items-center">
                        <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {autoRenew && (
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Auto-renewal enabled</span>
                        <span>Free</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>${checkoutData.total.toFixed(2)}</span>
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
        <div className="max-w-2xl mx-auto">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        </div>
      </div>
    </div>
  )
} 