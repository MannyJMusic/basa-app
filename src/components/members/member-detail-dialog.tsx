"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building, Calendar, Edit, X } from "lucide-react"
import { type Member } from "@/hooks/use-members"
import { formatDate } from "@/lib/utils"
import type { MembershipTier } from "@prisma/client"
import { MEMBERSHIP_TIERS, TIERS_IN_ORDER } from "@/lib/membership-tiers"
import {
  MEMBER_ROLES,
  MEMBER_STATUSES,
  NO_TIER,
  diffMemberForm,
  formStateFromMember,
  type MemberFormState,
  type MemberChanges,
  accountStatusOf,
} from "@/components/members/member-edit"

const INDUSTRY_TYPES = [
  "Technology", "Consulting", "Marketing", "Construction", "Real Estate", "Accounting",
  "Design", "Healthcare", "Education", "Legal", "Financial Services", "Insurance",
  "Manufacturing", "Retail", "Hospitality", "Transportation", "Non-Profit", "Government",
  "Media", "Food & Beverage", "Fitness & Wellness", "Other",
]
/** Select value for "no industry type" (Radix Select does not allow ""). */
const NO_INDUSTRY = "__none__"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
}
const ROLE_LABELS: Record<string, string> = {
  GUEST: "Guest (no member access)",
  MEMBER: "Member",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
}

export function memberStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "EXPIRED":
      return <Badge className="bg-orange-100 text-orange-800">Expired</Badge>
    case "INACTIVE":
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function memberTierBadge(tier?: string | null) {
  const def = tier ? MEMBERSHIP_TIERS[tier as MembershipTier] : undefined
  if (!def) return <Badge variant="outline">No Tier</Badge>
  return <Badge className="bg-blue-100 text-blue-800">{def.label}</Badge>
}

interface MemberDetailDialogProps {
  member: Member | null
  isOpen: boolean
  /** Open straight into edit mode (the list's Edit icon). */
  startEditing?: boolean
  onClose: () => void
  /** Saves the changes; throws with the API's message on failure. */
  onUpdate: (id: string, data: MemberChanges) => Promise<void>
  /** Asks for confirmation and deactivates; the page owns the confirm dialog. */
  onDeactivate: (member: Member) => void
  isLoading?: boolean
}

export function MemberDetailDialog({
  member,
  isOpen,
  startEditing = false,
  onClose,
  onUpdate,
  onDeactivate,
  isLoading = false
}: MemberDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initial = useMemo(() => (member ? formStateFromMember(member) : null), [member])
  const [formData, setFormData] = useState<MemberFormState | null>(initial)

  // Reset the form whenever a different (or refreshed) member is shown.
  useEffect(() => {
    setFormData(initial)
    setError(null)
  }, [initial])

  useEffect(() => {
    if (isOpen) setIsEditing(startEditing)
  }, [isOpen, startEditing, member?.id])

  if (!member || !formData || !initial) return null

  const set = <K extends keyof MemberFormState>(key: K, value: MemberFormState[K]) =>
    setFormData(prev => (prev ? { ...prev, [key]: value } : prev))

  const changes = diffMemberForm(initial, formData)
  const hasChanges = Object.keys(changes).length > 0
  const disabled = !isEditing || isLoading || isSaving

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false)
      return
    }
    if ("email" in changes && !changes.email) {
      setError("Email can't be empty.")
      return
    }
    try {
      setIsSaving(true)
      setError(null)
      await onUpdate(member.id, changes)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update member")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(initial)
    setError(null)
    setIsEditing(false)
  }

  // A stored industry type outside the fixed list is still shown and kept.
  const industryOptions = formData.businessType && !INDUSTRY_TYPES.includes(formData.businessType)
    ? [formData.businessType, ...INDUSTRY_TYPES]
    : INDUSTRY_TYPES
  // Same for a role outside the known four, so it is shown rather than blanked.
  const roleOptions: string[] = (MEMBER_ROLES as readonly string[]).includes(formData.role)
    ? [...MEMBER_ROLES]
    : [formData.role, ...MEMBER_ROLES]

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Member" : "Member Details"}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {member.user.firstName} {member.user.lastName}
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email (sign-in address)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => set("email", e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => set("role", value)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(r => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r] ?? r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Changed only if you pick a different role. Passwords are set by the member through
                    their invitation or Forgot password; staff cannot set them here.
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Account: {member.user.isActive
                    ? "can sign in"
                    : accountStatusOf(member) === "INACTIVE"
                      ? "not set up yet (send an invitation from Members → Invitations)"
                      : "sign-in turned off"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">Industry Type</Label>
                    <Select
                      value={formData.businessType || NO_INDUSTRY}
                      onValueChange={(value) => set("businessType", value === NO_INDUSTRY ? "" : value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_INDUSTRY}>Not set</SelectItem>
                        {industryOptions.map(i => (
                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry (comma-separated)</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => set("industry", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => set("businessEmail", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      value={formData.businessPhone}
                      onChange={(e) => set("businessPhone", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => set("businessAddress", e.target.value)}
                    disabled={disabled}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => set("city", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => set("state", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => set("zipCode", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://"
                    value={formData.website}
                    onChange={(e) => set("website", e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Membership Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="membershipTier">Membership Tier</Label>
                    <Select
                      value={formData.membershipTier}
                      onValueChange={(value) => set("membershipTier", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_TIER}>No tier</SelectItem>
                        {TIERS_IN_ORDER.map(t => (
                          <SelectItem key={t.tier} value={t.tier}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="membershipStatus">Membership Status</Label>
                    <Select
                      value={formData.membershipStatus}
                      onValueChange={(value) => set("membershipStatus", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="renewalDate">Renewal Date</Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={formData.renewalDate}
                      onChange={(e) => set("renewalDate", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                {isEditing && formData.membershipStatus === "ACTIVE" && initial.membershipStatus !== "ACTIVE" && !formData.renewalDate && (
                  <p className="text-xs text-muted-foreground">
                    With no renewal date, activating sets it to one year from today.
                  </p>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Current Status</h4>
                  <div className="flex gap-2">
                    {memberTierBadge(member.membershipTier)}
                    {memberStatusBadge(member.membershipStatus)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Joined: {formatDate(member.joinedAt)}</p>
                    <p>Renews: {member.renewalDate ? formatDate(member.renewalDate) : "not set"}</p>
                    <p>Member ID: {member.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => onDeactivate(member)}
              disabled={isSaving || isLoading}
            >
              Deactivate Member
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading || !hasChanges}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
