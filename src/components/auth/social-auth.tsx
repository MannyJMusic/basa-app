"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaLinkedin } from "react-icons/fa"

interface SocialAuthProps {
  mode?: "signin" | "signup"
}

export default function SocialAuth({ mode = "signin" }: SocialAuthProps) {
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

  const isSignUp = mode === "signup"

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? "Quick registration with" : "Or continue with"}
        </p>
      </div>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full flex items-center gap-3 h-12 text-base"
          onClick={() => handleSocialSignIn("google")}
          disabled={loading === "google"}
        >
          <FcGoogle className="h-5 w-5" />
          {loading === "google" 
            ? "Processing..." 
            : isSignUp 
              ? "Continue with Google" 
              : "Sign in with Google"
          }
        </Button>
        
        <Button
          variant="outline"
          className="w-full flex items-center gap-3 h-12 text-base"
          onClick={() => handleSocialSignIn("linkedin")}
          disabled={loading === "linkedin"}
        >
          <FaLinkedin className="h-5 w-5 text-blue-600" />
          {loading === "linkedin" 
            ? "Processing..." 
            : isSignUp 
              ? "Continue with LinkedIn" 
              : "Sign in with LinkedIn"
          }
        </Button>
      </div>

      {isSignUp && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      )}
    </div>
  )
} 