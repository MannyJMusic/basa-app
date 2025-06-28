"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Settings,
  Building2,
  Loader2,
  AlertTriangle,
  Download,
  Trash2
} from "lucide-react"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
  member?: {
    id: string
    membershipTier: string
    membershipStatus: string
    joinedAt: string
    renewalDate: string
  }
  notificationSettings: {
    emailNotifications: boolean
    eventReminders: boolean
    newsletter: boolean
    marketingEmails: boolean
    connectionRequests: boolean
    membershipUpdates: boolean
  }
  privacySettings: {
    showInDirectory: boolean
    allowContact: boolean
    showEmail: boolean
    showPhone: boolean
  }
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
    newsletter: false,
    marketingEmails: false,
    connectionRequests: true,
    membershipUpdates: true
  })
  const [privacySettings, setPrivacySettings] = useState({
    showInDirectory: true,
    allowContact: true,
    showEmail: false,
    showPhone: false
  })

  // Fetch user data
  useEffect(() => {
    console.log('Account page useEffect - session:', session)
    console.log('Session user:', session?.user)
    console.log('Session status:', status)
    
    if (status === 'loading') {
      console.log('Session is loading...')
      return
    }
    
    if (session?.user) {
      console.log('User authenticated, fetching data...')
      fetchUserData()
    } else if (status === 'unauthenticated') {
      console.log('User not authenticated, setting loading to false')
      setLoading(false)
    }
  }, [session, status])

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data, session:', session)
      console.log('Session user:', session?.user)
      
      const response = await fetch('/api/account', {
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Account data received:', data)
        setUserData(data)
        // Set initial settings from API response
        setNotificationSettings(data.notificationSettings)
        setPrivacySettings(data.privacySettings)
      } else {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        toast({
          title: "Error",
          description: "Failed to fetch account data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch account data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully"
        })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update password",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationSettingsUpdate = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationSettings)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification settings updated successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update notification settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePrivacySettingsUpdate = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(privacySettings)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Privacy settings updated successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update privacy settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/account/export', {
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = 'basa-account-data.json'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(downloadLink)
        
        toast({
          title: "Success",
          description: "Account data exported successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to export account data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export account data",
        variant: "destructive"
      })
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to access your account settings</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load account data</p>
      </div>
    )
  } else if (userData.role === "GUEST") {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome, Guest!</h2>
        <p className="mb-4">You have limited access. <a href="/membership/join" className="underline text-blue-600">Join as a member</a> to unlock full account features.</p>
        {/* Show only basic info */}
        <div className="bg-gray-50 p-4 rounded shadow">
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences, security, and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your password and account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose how and when you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="eventReminders">Event Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
                </div>
                <Switch
                  id="eventReminders"
                  checked={notificationSettings.eventReminders}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, eventReminders: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="connectionRequests">Connection Requests</Label>
                  <p className="text-sm text-gray-500">Notify when someone wants to connect</p>
                </div>
                <Switch
                  id="connectionRequests"
                  checked={notificationSettings.connectionRequests}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, connectionRequests: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="membershipUpdates">Membership Updates</Label>
                  <p className="text-sm text-gray-500">Important membership and billing updates</p>
                </div>
                <Switch
                  id="membershipUpdates"
                  checked={notificationSettings.membershipUpdates}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, membershipUpdates: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletter">Newsletter</Label>
                  <p className="text-sm text-gray-500">Receive monthly newsletter</p>
                </div>
                <Switch
                  id="newsletter"
                  checked={notificationSettings.newsletter}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newsletter: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  <p className="text-sm text-gray-500">Receive promotional content</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
            </div>
            
            <Button onClick={handleNotificationSettingsUpdate} className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <CardTitle>Privacy Settings</CardTitle>
            </div>
            <CardDescription>
              Control your privacy and visibility settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showInDirectory">Show in Member Directory</Label>
                  <p className="text-sm text-gray-500">Allow other members to find you</p>
                </div>
                <Switch
                  id="showInDirectory"
                  checked={privacySettings.showInDirectory}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showInDirectory: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowContact">Allow Contact</Label>
                  <p className="text-sm text-gray-500">Let members contact you directly</p>
                </div>
                <Switch
                  id="allowContact"
                  checked={privacySettings.allowContact}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowContact: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showEmail">Show Email Address</Label>
                  <p className="text-sm text-gray-500">Display your email publicly</p>
                </div>
                <Switch
                  id="showEmail"
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showPhone">Show Phone Number</Label>
                  <p className="text-sm text-gray-500">Display your phone number publicly</p>
                </div>
                <Switch
                  id="showPhone"
                  checked={privacySettings.showPhone}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>
            </div>
            
            <Button onClick={handlePrivacySettingsUpdate} className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>
              Your account details and membership status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-gray-600">
                  {userData.member?.membershipTier || "Basic"} Membership
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={
                  userData.member?.membershipStatus === "ACTIVE" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }
              >
                {userData.member?.membershipStatus || "Unknown"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-gray-600">
                {userData.member?.joinedAt 
                  ? new Date(userData.member.joinedAt).toLocaleDateString() 
                  : "N/A"
                }
              </p>
            </div>
            
            {userData.member?.renewalDate && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Next Renewal Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(userData.member.renewalDate).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Account Created</p>
              <p className="text-sm text-gray-600">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {userData.lastLogin && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-gray-600">
                  {new Date(userData.lastLogin).toLocaleString()}
                </p>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Account Actions</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" disabled>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cancel Membership</p>
                <p className="text-sm text-gray-500">
                  Cancel your membership at the end of the current billing period
                </p>
              </div>
              <Button variant="outline" disabled>
                Cancel Membership
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 