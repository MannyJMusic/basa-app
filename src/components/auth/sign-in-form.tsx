"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { getRedirectUrl } from "@/lib/utils"
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
        setError(res.error)
      } else if (res?.ok) {
        // Wait for session to update and get the user's role
        const session = await getSession()
        const role = (session?.user?.role as UserRole) || "GUEST"
        const redirectUrl = getRedirectUrl(role)
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
      </div>
      <Button type="submit" className="w-full text-white" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
} 