"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  UserPlus,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield
} from "lucide-react"
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Membership pricing structure
const MEMBERSHIP_TIERS = {
  'meeting-member': {
    name: 'Meeting Member',
    price: 149,
    description: 'Perfect for new members starting their networking journey'
  },
  'associate-member': {
    name: 'Associate Member',
    price: 245,
    description: 'Most popular choice for growing businesses'
  },
  'trio-member': {
    name: 'TRIO Member',
    price: 295,
    description: 'Access to all three chapters for maximum networking'
  },
  'class-resource-member': {
    name: 'Class Resource Member',
    price: 120,
    description: 'Access to training classes and resource benefits'
  },
  'nag-resource-member': {
    name: 'NAG Resource Member',
    price: 0,
    description: 'Best value - Networking & Giving membership'
  },
  'training-resource-member': {
    name: 'Training Resource Member',
    price: 225,
    description: 'Guaranteed training access and trainer opportunities'
  }
}

interface MemberFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  businessName?: string
  membershipTier: keyof typeof MEMBERSHIP_TIERS
  role: "MEMBER" | "MODERATOR" | "ADMIN"
}

interface PaymentData {
  method: "credit_card" | "cash" | "check"
  amount: number
  clientSecret?: string
  billingInfo?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  checkNumber?: string
  cashAmount?: number
}

interface EnhancedMemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function StripePaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError 
}: { 
  clientSecret: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/admin/members`,
      },
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Payment failed')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
}

export function EnhancedMemberForm({ isOpen, onClose, onSuccess }: EnhancedMemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    membershipTier: "meeting-member",
    role: "MEMBER"
  })

  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "credit_card",
    amount: MEMBERSHIP_TIERS["meeting-member"].price * 100 // Convert to cents
  })

  const [step, setStep] = useState<"member-info" | "payment" | "processing" | "success">("member-info")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const selectedTier = MEMBERSHIP_TIERS[formData.membershipTier]
  const amountInCents = selectedTier.price * 100

  useEffect(() => {
    setPaymentData(prev => ({ ...prev, amount: amountInCents }))
  }, [formData.membershipTier, amountInCents])

  const handleNext = async () => {
    if (step === "member-info") {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("Please fill in all required fields")
        return
      }

      if (selectedTier.price > 0) {
        // Create payment intent for credit card payments
        if (paymentData.method === "credit_card") {
          setLoading(true)
          try {
            const response = await fetch("/api/admin/create-payment-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: amountInCents,
                email: formData.email,
                metadata: {
                  type: "admin_membership",
                  tier: formData.membershipTier,
                  adminCreated: "true"
                }
              })
            })

            if (!response.ok) {
              throw new Error("Failed to create payment intent")
            }

            const { clientSecret: secret } = await response.json()
            setClientSecret(secret)
            setStep("payment")
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment setup failed")
          } finally {
            setLoading(false)
          }
        } else {
          // For cash/check payments, proceed directly to processing
          setStep("processing")
          await processPayment()
        }
      } else {
        // Free membership, proceed directly to processing
        setStep("processing")
        await processPayment()
      }
    }
  }

  const processPayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/create-member-with-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberData: formData,
          paymentData: {
            ...paymentData,
            clientSecret: clientSecret || undefined
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create member")
      }

      const result = await response.json()
      
      if (result.success) {
        setStep("success")
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 3000)
      } else {
        throw new Error(result.error || "Failed to create member")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create member")
      setStep("member-info")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setStep("processing")
    await processPayment()
  }

  const handlePaymentError = (error: string) => {
    setError(error)
    setStep("member-info")
  }

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      businessName: "",
      membershipTier: "meeting-member",
      role: "MEMBER"
    })
    setPaymentData({
      method: "credit_card",
      amount: MEMBERSHIP_TIERS["meeting-member"].price * 100
    })
    setStep("member-info")
    setError(null)
    setClientSecret(null)
    onClose()
  }

  const renderMemberInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Member Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="membershipTier">Membership Tier</Label>
          <Select
            value={formData.membershipTier}
            onValueChange={(value: keyof typeof MEMBERSHIP_TIERS) => 
              setFormData(prev => ({ ...prev, membershipTier: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
                <SelectItem key={key} value={key}>
                  {tier.name} - ${tier.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "MEMBER" | "MODERATOR" | "ADMIN") => 
              setFormData(prev => ({ ...prev, role: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="MODERATOR">Moderator</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <div className="space-y-4">
          <div>
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                type="button"
                variant={paymentData.method === "credit_card" ? "default" : "outline"}
                onClick={() => setPaymentData(prev => ({ ...prev, method: "credit_card" }))}
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Credit Card
              </Button>
              <Button
                type="button"
                variant={paymentData.method === "cash" ? "default" : "outline"}
                onClick={() => setPaymentData(prev => ({ ...prev, method: "cash" }))}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentData.method === "check" ? "default" : "outline"}
                onClick={() => setPaymentData(prev => ({ ...prev, method: "check" }))}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Check
              </Button>
            </div>
          </div>

          {paymentData.method === "check" && (
            <div>
              <Label htmlFor="checkNumber">Check Number</Label>
              <Input
                id="checkNumber"
                value={paymentData.checkNumber || ""}
                onChange={(e) => setPaymentData(prev => ({ ...prev, checkNumber: e.target.value }))}
                placeholder="Enter check number"
              />
            </div>
          )}

          {paymentData.method === "cash" && (
            <div>
              <Label htmlFor="cashAmount">Cash Amount Received</Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                value={paymentData.cashAmount || selectedTier.price}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  cashAmount: parseFloat(e.target.value) || selectedTier.price 
                }))}
                placeholder="Enter amount received"
              />
            </div>
          )}

          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Membership:</span>
                <span>{selectedTier.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span className="text-lg font-bold">${selectedTier.price.toFixed(2)}</span>
              </div>
              {paymentData.method === "cash" && paymentData.cashAmount && paymentData.cashAmount > selectedTier.price && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Change:</span>
                  <span>${(paymentData.cashAmount - selectedTier.price).toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
        <p className="text-gray-600">Complete the payment to create the member account</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold">${(amountInCents / 100).toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">
            {selectedTier.name} - {selectedTier.description}
          </div>
        </CardContent>
      </Card>

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={amountInCents}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      )}
    </div>
  )

  const renderProcessingStep = () => (
    <div className="text-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
      <h3 className="text-lg font-semibold">Processing Payment & Creating Member</h3>
      <p className="text-gray-600">Please wait while we process your payment and create the member account...</p>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
      <h3 className="text-lg font-semibold text-green-600">Member Created Successfully!</h3>
      <p className="text-gray-600">
        {formData.firstName} {formData.lastName} has been added as a member.
      </p>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          A welcome email and payment receipt have been sent to {formData.email}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Member with Payment
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {step === "member-info" && renderMemberInfoStep()}
          {step === "payment" && renderPaymentStep()}
          {step === "processing" && renderProcessingStep()}
          {step === "success" && renderSuccessStep()}
        </div>

        {step === "member-info" && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleNext}
              disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedTier.price > 0 ? "Continue to Payment" : "Create Member"}
                </>
              )}
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setStep("member-info")}>
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 