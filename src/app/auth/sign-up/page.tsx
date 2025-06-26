"use client"

import { useSearchParams } from 'next/navigation'
import SignUpForm from '@/components/auth/sign-up-form'
import SocialAuth from '@/components/auth/social-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Info } from 'lucide-react'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const provider = searchParams.get('provider')
  const email = searchParams.get('email')

  const getErrorMessage = () => {
    switch (error) {
      case 'social_signup_required':
        return {
          title: 'Account Required',
          description: `You need to create a BASA account before signing in with ${provider}. Please complete the registration form below.`,
          variant: 'default' as const
        }
      case 'email_exists':
        return {
          title: 'Email Already Registered',
          description: 'An account with this email already exists. Please sign in with your existing account and link your social account in your settings.',
          variant: 'destructive' as const
        }
      default:
        return null
    }
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Create Your BASA Account</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant={errorMessage.variant} className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{errorMessage.title}</strong>
                <br />
                {errorMessage.description}
              </AlertDescription>
            </Alert>
          )}
          <SignUpForm prefillEmail={email} />
          <Separator className="my-6" />
          <SocialAuth />
        </CardContent>
      </Card>
    </div>
  )
} 