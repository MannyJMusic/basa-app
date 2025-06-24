import SignUpForm from '@/components/auth/sign-up-form'
import SocialAuth from '@/components/auth/social-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Create Your BASA Account</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <Separator className="my-6" />
          <SocialAuth />
        </CardContent>
      </Card>
    </div>
  )
} 