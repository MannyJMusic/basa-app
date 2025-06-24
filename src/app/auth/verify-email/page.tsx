import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Email Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your email has been verified. You can now sign in to your account.</p>
        </CardContent>
      </Card>
    </div>
  )
} 