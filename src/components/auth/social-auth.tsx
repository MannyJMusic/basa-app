"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaLinkedin } from "react-icons/fa"

export default function SocialAuth() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSocialSignIn(provider: string) {
    setLoading(provider)
    try {
      // Use redirect: true to let NextAuth handle the redirect automatically
      await signIn(provider, { 
        callbackUrl: "/dashboard",
        redirect: true 
      })
    } catch (error) {
      console.error("Social login error:", error)
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