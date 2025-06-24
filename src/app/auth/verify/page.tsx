import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyPage() {
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