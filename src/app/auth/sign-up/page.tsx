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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join BASA</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create your account to access the San Antonio business community
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
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
          
          {/* Social Authentication - Prominent placement */}
          <div>
            <SocialAuth mode="signup" />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create account with email
              </span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <SignUpForm prefillEmail={email} />
        </CardContent>
      </Card>
    </div>
  )
} 