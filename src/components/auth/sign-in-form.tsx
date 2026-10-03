"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { getRedirectUrl, safeCallbackPath } from "@/lib/utils"
import { UserRole } from "@/lib/types"

interface SignInFormProps {
  prefillEmail?: string | null
}

export default function SignInForm({ prefillEmail }: SignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Prefill email if provided
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail)
    }
  }, [prefillEmail])

  // NextAuth lands here with ?error=AccessDenied when the signIn callback refuses
  // a Google account: unknown address (no self-registration, #166), an account
  // that has not been set up yet (invited members), or a deactivated one. Other
  // codes (Configuration, OAuthCallbackError, ...) get a generic message rather
  // than a blank form. The sign-in page itself explains email_exists and
  // CredentialsSignin.
  useEffect(() => {
    const code = searchParams.get("error")
    if (!code || code === "email_exists" || code === "CredentialsSignin") return
    if (code === "AccessDenied") {
      setError(
        "We couldn't sign you in with Google. If you are a BASA member, set up your account with the link in " +
          "your invitation email or use Forgot password, then you can sign in with Google using the same email."
      )
    } else {
      setError(
        "Something went wrong signing you in. Please try again, or sign in with your email and password. " +
          "If it keeps happening, contact info@businessassociationsa.com."
      )
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (res?.error) {
        // Provide more user-friendly error messages
        switch (res.error) {
          case 'CredentialsSignin':
            setError('Invalid email or password. Please check your credentials and try again.')
            break
          case 'EmailSignin':
            setError('There was an issue with email authentication. Please try again.')
            break
          default:
            setError(res.error)
        }
      } else if (res?.ok) {
        // Wait for session to update and get the user's role
        const session = await getSession()
        const role = (session?.user?.role as UserRole) || "GUEST"
        // Back to where they came from (e.g. an event checkout), else their dashboard.
        const redirectUrl = safeCallbackPath(searchParams.get("callbackUrl")) ?? getRedirectUrl(role)
        router.push(redirectUrl)
      }
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <Alert variant="destructive">{error}</Alert>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          readOnly={!!prefillEmail}
          className={prefillEmail ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div className="mt-1 text-right">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-[#1B365D] underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          First time signing in? Use the link in your invitation email, or Forgot password to set up your account.
        </p>
      </div>
      <Button type="submit" className="w-full text-white" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
} 