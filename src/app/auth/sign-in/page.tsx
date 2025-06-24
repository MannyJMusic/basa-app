import SignInForm from '@/components/auth/sign-in-form'
import SocialAuth from '@/components/auth/social-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Sign In to BASA</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm />
          <Separator className="my-6" />
          <SocialAuth />
        </CardContent>
      </Card>
    </div>
  )
}