import ResetPasswordForm from '@/components/auth/reset-password-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * `claim=1` marks a member from the old WordPress site setting a password for the
 * first time (#104). Telling them to "reset" a password they never had is the
 * dishonest answer that issue was filed about.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>
}) {
  const claiming = (await searchParams).claim === '1'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>{claiming ? 'Set Up Your Account' : 'Reset Password'}</CardTitle>
          <CardDescription>
            {claiming
              ? 'Your membership record came across from our previous website. Choose a password and your account is ready to use.'
              : 'Choose a new password for your BASA account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
