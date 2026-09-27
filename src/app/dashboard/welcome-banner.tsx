"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/** Shown once per browser after a verified, active user first reaches the dashboard. */
export function WelcomeBanner({ userId, firstName }: { userId: string; firstName: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const key = `welcome-shown-${userId}`
    try {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, "true")
    } catch {
      return // storage blocked: skip the banner rather than show it every visit
    }
    setShow(true)
  }, [userId])

  if (!show) return null
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Welcome to BASA, {firstName || "Member"}!</strong>{" "}
        Your email has been successfully verified and your account is now active. We&apos;re excited to have you join the San Antonio business community.
        Take a moment to explore your dashboard and complete your profile.
      </AlertDescription>
    </Alert>
  )
}
