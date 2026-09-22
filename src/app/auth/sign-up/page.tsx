import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OFFICE_CONTACT } from "@/lib/feature-flags"

/**
 * There is no self-registration (#166). Accounts are created by BASA staff or by
 * a membership purchase. This page stays so old links and bookmarks explain that
 * instead of 404ing.
 */
export const metadata = { title: "Join BASA" }

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join BASA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            BASA accounts are set up by our office when you become a member, so there is
            no sign-up form here.
          </p>
          <p>
            To join, or if you are already a member and need access, contact {OFFICE_CONTACT.name} at{" "}
            <a className="underline" href={OFFICE_CONTACT.phoneHref}>{OFFICE_CONTACT.phone}</a> or{" "}
            <a className="underline" href={`mailto:${OFFICE_CONTACT.email}`}>{OFFICE_CONTACT.email}</a>.
          </p>
          <p>
            Already have an account?{" "}
            <Link className="underline" href="/auth/sign-in">Sign in</Link>. Imported from our
            previous website? Use{" "}
            <Link className="underline" href="/auth/forgot-password">Forgot password</Link> to set
            yours.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
