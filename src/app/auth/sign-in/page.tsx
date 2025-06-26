"use client"

import { useSearchParams } from 'next/navigation'
import SignInForm from '@/components/auth/sign-in-form'
import SocialAuth from '@/components/auth/social-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Info } from 'lucide-react'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const email = searchParams.get('email')

  const getErrorMessage = () => {
    switch (error) {
      case 'email_exists':
        return {
          title: 'Account Already Exists',
          description: 'An account with this email already exists. Please sign in with your existing account and link your social account in your settings.',
          variant: 'destructive' as const
        }
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          description: 'The email or password you entered is incorrect. Please try again.',
          variant: 'destructive' as const
        }
      default:
        return null
    }
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/backgrounds/basa-skyline.jpg')" }}
        aria-hidden="true"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#1B365D]/80 to-[#17A2B8]/60" aria-hidden="true" />
      {/* Content */}
      <div className="relative z-20 flex items-center justify-center w-full">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Sign In to BASA</CardTitle>
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
            <SignInForm prefillEmail={email} />
            <Separator className="my-6" />
            <SocialAuth mode="signin" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}