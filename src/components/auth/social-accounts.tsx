"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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

export default function SocialAccounts() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleConnect = async (provider: string) => {
    // This would typically redirect to the OAuth provider
    // For now, we'll just show a message
    console.log(`Connecting to ${provider}...`)
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

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google',
          icon: 'G',
          color: 'bg-red-500',
          email: accounts.find(acc => acc.provider === 'google')?.email
        }
      case 'linkedin':
        return {
          name: 'LinkedIn',
          icon: 'L',
          color: 'bg-blue-600',
          email: accounts.find(acc => acc.provider === 'linkedin')?.email
        }
      default:
        return {
          name: provider.charAt(0).toUpperCase() + provider.slice(1),
          icon: provider.charAt(0).toUpperCase(),
          color: 'bg-gray-500',
          email: undefined
        }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-blue-600" />
            <CardTitle>Social Accounts</CardTitle>
          </div>
          <CardDescription>
            Manage your linked social media accounts for easy sign-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
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
          Manage your linked social media accounts for easy sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Google */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-gray-500">
                  {accounts.find(acc => acc.provider === 'google') 
                    ? accounts.find(acc => acc.provider === 'google')?.email || 'Connected'
                    : 'Not connected'
                  }
                </p>
              </div>
            </div>
            {accounts.find(acc => acc.provider === 'google') ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Connected</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDisconnect(accounts.find(acc => acc.provider === 'google')!.id)}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleConnect('google')}>
                <Link className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
          </div>
          
          {/* LinkedIn */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <div>
                <p className="font-medium">LinkedIn</p>
                <p className="text-sm text-gray-500">
                  {accounts.find(acc => acc.provider === 'linkedin') 
                    ? accounts.find(acc => acc.provider === 'linkedin')?.email || 'Connected'
                    : 'Not connected'
                  }
                </p>
              </div>
            </div>
            {accounts.find(acc => acc.provider === 'linkedin') ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Connected</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDisconnect(accounts.find(acc => acc.provider === 'linkedin')!.id)}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleConnect('linkedin')}>
                <Link className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="text-sm text-gray-600">
          <p>• Connected accounts allow you to sign in quickly</p>
          <p>• You can disconnect accounts at any time</p>
          <p>• Your email and basic profile info will be shared</p>
        </div>
      </CardContent>
    </Card>
  )
} 