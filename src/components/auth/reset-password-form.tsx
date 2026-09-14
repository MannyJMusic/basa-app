"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"

/**
 * Set a password from an emailed link.
 *
 * Serves two cases that differ only in wording: a normal password reset, and a
 * member from the old WordPress site claiming an imported account for the first
 * time (#104), which the link marks with `claim=1`.
 */
export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const claiming = searchParams.get("claim") === "1"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!token) {
      setError("Invalid or missing token.")
      return
    }
    // Checked here as well as on the server so a mismatch is an immediate,
    // specific message rather than a round trip that says "Validation failed".
    if (password !== confirmPassword) {
      setError("Those passwords don't match.")
      return
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // confirmPassword is required by passwordResetSchema. Omitting it used to
        // fail every submission with a 400 before the request reached any logic.
        body: JSON.stringify({ token, password, confirmPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to set your password")
      } else {
        setSuccess(
          claiming
            ? "Your account is set up. You can now sign in."
            : "Password reset! You can now sign in."
        )
        setTimeout(() => router.push("/auth/sign-in"), 2000)
      }
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div>
        <Label htmlFor="password">{claiming ? "Choose a password" : "New password"}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          At least 8 characters, with an uppercase letter, a lowercase letter and a number.
        </p>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? (claiming ? "Setting up..." : "Resetting...")
          : (claiming ? "Set Up My Account" : "Reset Password")}
      </Button>
    </form>
  )
}
