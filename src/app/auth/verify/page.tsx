import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Verification emails link here (`/auth/verify?token=…`); the page that actually
 * checks the token is /auth/verify-email. Forward a token so old and new links
 * both work; without one, explain what to look for.
 */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams
  const value = Array.isArray(token) ? token[0] : token
  if (value) {
    redirect(`/auth/verify-email?token=${encodeURIComponent(value)}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please check your email for a verification link to activate your account.</p>
        </CardContent>
      </Card>
    </div>
  )
}
