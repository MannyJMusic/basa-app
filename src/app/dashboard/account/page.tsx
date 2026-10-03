"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import type { MembershipTier, Status } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { tierLabel } from "@/lib/membership-tiers"
import {
  User,
  Shield,
  Bell,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Building2,
  Loader2,
} from "lucide-react"

const OFFICE_EMAIL = "info@businessassociationsa.com"

interface Preferences {
  newsletterSubscribed: boolean
  showInDirectory: boolean
  allowContact: boolean
  showAddress: boolean
}

interface AccountData {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  member: {
    id: string
    membershipTier: MembershipTier | null
    membershipStatus: Status
    joinedAt: string
    renewalDate: string | null
    cancelAtPeriodEnd: boolean
  } | null
  preferences: Preferences
}

const STATUS_LABEL: Record<Status, string> = {
  ACTIVE: "Active",
  PENDING: "Not active",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Chicago", dateStyle: "medium" })

export default function AccountPage() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const { toast } = useToast()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [preferences, setPreferences] = useState<Preferences | null>(null)

  // Load once per signed-in user. Depending on the session object would
  // refetch on every window focus and overwrite unsaved toggles.
  useEffect(() => {
    if (status === "loading") return
    if (!userId) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch("/api/account")
        if (!response.ok) throw new Error(String(response.status))
        const data: AccountData = await response.json()
        if (cancelled) return
        setAccount(data)
        setPreferences(data.preferences)
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, status])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" })
      return
    }

    setSavingPassword(true)
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        toast({
          title: "Password not changed",
          description: error.error || "Failed to update password",
          variant: "destructive",
        })
        return
      }

      // Changing the password ends every existing session, this one included.
      // Sign this browser back in with the new password; if that fails, send
      // the member to the sign-in page rather than leave a dead session.
      const email = account?.email ?? session?.user?.email
      const res = email
        ? await signIn("credentials", { email, password: passwordData.newPassword, redirect: false })
        : null
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      if (res?.ok && !res.error) {
        toast({
          title: "Password changed",
          description: "You have been signed out on your other devices.",
        })
      } else {
        await signOut({ callbackUrl: "/auth/sign-in" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to update password", variant: "destructive" })
    } finally {
      setSavingPassword(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    if (!preferences) return
    setSavingPrefs(true)
    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
      if (!response.ok) throw new Error(String(response.status))
      const data = await response.json()
      setPreferences(data.preferences)
      toast({ title: "Saved", description: "Your preferences have been updated." })
    } catch {
      toast({ title: "Error", description: "Failed to save your preferences", variant: "destructive" })
    } finally {
      setSavingPrefs(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!account || !preferences || loadError) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load your account. Please refresh the page.</p>
      </div>
    )
  }

  const isGuest = account.role === "GUEST"
  const member = account.member
  const membershipActive = member?.membershipStatus === "ACTIVE"

  const toggle = (key: keyof Preferences, label: string, help: string) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor={key}>{label}</Label>
        <p className="text-sm text-gray-500">{help}</p>
      </div>
      <Switch
        id={key}
        checked={preferences[key]}
        onCheckedChange={(checked) => setPreferences(prev => (prev ? { ...prev, [key]: checked } : prev))}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your password, email preferences and directory privacy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle>Password</CardTitle>
            </div>
            <CardDescription>
              Changing your password signs you out on your other devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {([
                ["currentPassword", "current", "Current Password", "current-password"],
                ["newPassword", "new", "New Password", "new-password"],
                ["confirmPassword", "confirm", "Confirm New Password", "new-password"],
              ] as const).map(([field, visibility, label, autoComplete]) => (
                <div key={field}>
                  <Label htmlFor={field}>{label}</Label>
                  <div className="relative">
                    <Input
                      id={field}
                      type={showPasswords[visibility] ? "text" : "password"}
                      value={passwordData[field]}
                      autoComplete={autoComplete}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, [field]: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      aria-label={showPasswords[visibility] ? "Hide password" : "Show password"}
                      onClick={() => setShowPasswords(prev => ({ ...prev, [visibility]: !prev[visibility] }))}
                    >
                      {showPasswords[visibility] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="submit" className="w-full" disabled={savingPassword}>
                {savingPassword ? (
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

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <CardTitle>Email &amp; Privacy</CardTitle>
            </div>
            <CardDescription>
              What we send you and what other members can see
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {toggle("newsletterSubscribed", "BASA Newsletter", "Receive the BASA email newsletter")}
            {!isGuest && (
              <>
                <Separator />
                {toggle("showInDirectory", "Show in Member Directory", "List your business in the members-only directory")}
                {toggle("allowContact", "Share Contact Details", "Show your business email and phone to other members")}
                {toggle("showAddress", "Share Business Address", "Show your street address and ZIP to other members")}
              </>
            )}

            <Button onClick={handlePreferencesUpdate} className="w-full" disabled={savingPrefs}>
              {savingPrefs ? (
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

        {/* Account Information */}
        <Card className="lg:col-span-2">
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
                <p className="font-medium">Membership</p>
                <p className="text-sm text-gray-600">
                  {member && membershipActive ? tierLabel(member.membershipTier) : "No active membership"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={membershipActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {member ? STATUS_LABEL[member.membershipStatus] : "Not a member"}
              </Badge>
            </div>

            {!membershipActive && (
              <p className="text-sm text-gray-600">
                <Link href="/membership" className="text-blue-600 underline">View membership levels</Link>
                {" "}or contact the office to join or renew.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {member?.joinedAt && membershipActive && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-gray-600">{formatDate(member.joinedAt)}</p>
                </div>
              )}

              {member?.renewalDate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {member.cancelAtPeriodEnd ? "Membership Ends" : "Renewal Date"}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(member.renewalDate)}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-sm text-gray-600">{formatDate(account.createdAt)}</p>
              </div>

              {account.lastLogin && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Sign-in</p>
                  <p className="text-sm text-gray-600">
                    {new Date(account.lastLogin).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                <User className="inline w-4 h-4 mr-1 align-text-bottom" />
                To close your account, contact the office.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${OFFICE_EMAIL}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
