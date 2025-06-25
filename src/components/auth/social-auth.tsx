"use client"

import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaLinkedin } from "react-icons/fa"
import { getRedirectUrl } from "@/lib/utils"
import { UserRole } from "@/lib/types"

export default function SocialAuth() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSocialSignIn(provider: string) {
    setLoading(provider)
    try {
      const result = await signIn(provider, { redirect: false })
      if (result?.ok) {
        // Wait for session to update and get the user's role
        const session = await getSession()
        const role = (session?.user?.role as UserRole) || "GUEST"
        const redirectUrl = getRedirectUrl(role)
        window.location.href = redirectUrl
      }
    } catch (error) {
      console.error("Social login error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => handleSocialSignIn("google")}
        disabled={loading === "google"}
      >
        <FcGoogle className="h-5 w-5" />
        {loading === "google" ? "Signing in..." : "Sign in with Google"}
      </Button>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => handleSocialSignIn("linkedin")}
        disabled={loading === "linkedin"}
      >
        <FaLinkedin className="h-5 w-5" />
        {loading === "linkedin" ? "Signing in..." : "Sign in with LinkedIn"}
      </Button>
    </div>
  )
} 