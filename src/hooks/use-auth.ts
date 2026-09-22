import { useSession, signIn, signOut, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoginFormData, PasswordResetRequestData } from "@/lib/validations"
import { getRedirectUrl } from "@/lib/utils"
import { Role } from "@/lib/types"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return false
      }

      if (result?.ok) {
        // Wait for session to update
        await update()
        const newSession = await getSession()
        const role = newSession?.user?.role || "GUEST"
        const redirectUrl = getRedirectUrl(role as Role)
        router.push(redirectUrl)
        return true
      }

      return false
    } catch (err) {
      setError("An error occurred during login")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      router.push("/")
    } catch (err) {
      setError("An error occurred during logout")
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (data: PasswordResetRequestData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to send reset email")
        return false
      }

      return true
    } catch (err) {
      setError("An error occurred while processing your request")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to reset password")
        return false
      }

      return true
    } catch (err) {
      setError("An error occurred while resetting your password")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const socialLogin = async (provider: "google" | "linkedin") => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (err) {
      setError("An error occurred during social login")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      await update()
    } catch (err) {
      console.error("Failed to refresh session:", err)
    }
  }

  return {
    session,
    status,
    isLoading,
    error,
    login,
    logout,
    forgotPassword,
    resetPassword,
    socialLogin,
    refreshSession,
    isAuthenticated: !!session?.user,
    isActive: session?.user?.isActive || false,
    userRole: session?.user?.role || "GUEST",
    user: session?.user,
  }
} 