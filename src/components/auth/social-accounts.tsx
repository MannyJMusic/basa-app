"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link, Unlink } from "lucide-react"

interface SocialAccount {
  id: string
  provider: string
  providerAccountId: string
  email?: string
}

/**
 * Google is the only social sign-in BASA offers (LinkedIn's provider is disabled in
 * src/lib/auth.ts). Connecting runs a Google sign-in: the signIn callback links the
 * Google identity when its address is the same as this account's.
 */
export default function SocialAccounts() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchSocialAccounts()
    }
  }, [session?.user?.id])

  const fetchSocialAccounts = async () => {
    try {
      const response = await fetch('/api/auth/social-accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Error fetching social accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await signIn('google', { callbackUrl: window.location.pathname, redirect: true })
    } catch (error) {
      console.error('Error connecting Google:', error)
      setConnecting(false)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      const response = await fetch(`/api/auth/social-accounts/${accountId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setAccounts(accounts.filter(account => account.id !== accountId))
      }
    } catch (error) {
      console.error('Error disconnecting account:', error)
    }
  }

  const google = accounts.find(acc => acc.provider === 'google')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-blue-600" />
            <CardTitle>Social Accounts</CardTitle>
          </div>
          <CardDescription>
            Manage your linked accounts for easy sign-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Link className="w-5 h-5 text-blue-600" />
          <CardTitle>Social Accounts</CardTitle>
        </div>
        <CardDescription>
          Manage your linked accounts for easy sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-gray-500">
                  {google ? google.email || 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {google ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Connected</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(google.id)}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnect} disabled={connecting}>
                <Link className="w-4 h-4 mr-2" />
                {connecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="text-sm text-gray-600">
          <p>• Use a Google account with the same email address as your BASA account</p>
          <p>• Once connected, you can sign in with Google instead of your password</p>
          <p>• You can disconnect it at any time</p>
        </div>
      </CardContent>
    </Card>
  )
}
