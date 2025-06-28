'use client'

import { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, CreditCard, Lock } from 'lucide-react'

interface StripeFormProps {
  clientSecret: string
  amount: number
  description: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  loading?: boolean
  type?: string
}

export function StripeForm({
  clientSecret,
  amount,
  description,
  onSuccess,
  onError,
  loading = false,
  type
}: StripeFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setMessage(error.message || 'Payment failed')
      onError(error.message || 'Payment failed')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment successful!')
      onSuccess(paymentIntent.id)
      if (type) {
        window.location.href = `/payment/success?type=${type}&paymentId=${paymentIntent.id}`
      }
    }

    setIsProcessing(false)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <Lock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Secure Payment</CardTitle>
            <CardDescription>Powered by Stripe</CardDescription>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatAmount(amount)}
          </div>
          <p className="text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          
          {message && (
            <Alert className={`mt-4 ${message.includes('successful') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertCircle className={`h-4 w-4 ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`} />
              <AlertDescription className={message.includes('successful') ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!stripe || isProcessing || loading}
            className="w-full mt-6"
            size="lg"
          >
            {isProcessing || loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Lock className="w-4 h-4 mr-1" />
            Your payment information is secure and encrypted
          </div>
          <div className="flex items-center justify-center mt-2">
            <Badge variant="outline" className="text-xs">
              SSL Secured
            </Badge>
            <Badge variant="outline" className="text-xs ml-2">
              PCI Compliant
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 