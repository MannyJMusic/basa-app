"use client"

import { useState, useEffect } from "react"
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
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff
} from "lucide-react"
import { type Member, type UpdateMemberData } from "@/hooks/use-members"
import { formatDate } from "@/lib/utils"

interface MemberDetailDialogProps {
  member: Member | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, data: UpdateMemberData) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  isLoading?: boolean
}

export function MemberDetailDialog({
  member,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isLoading = false
}: MemberDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UpdateMemberData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "",
    industry: [],
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    membershipTier: "BASIC",
    membershipStatus: "ACTIVE",
    role: "MEMBER"
  })

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.user.firstName || "",
        lastName: member.user.lastName || "",
        email: member.user.email || "",
        password: "",
        businessName: member.businessName || "",
        businessType: member.businessType || "",
        industry: member.industry || [],
        businessEmail: member.businessEmail || "",
        businessPhone: member.businessPhone || "",
        businessAddress: member.businessAddress || "",
        city: member.city || "",
        state: member.state || "",
        zipCode: member.zipCode || "",
        website: member.website || "",
        membershipTier: member.membershipTier || "BASIC",
        membershipStatus: member.membershipStatus || "ACTIVE",
        role: (member.user.role === "ADMIN" || member.user.role === "MODERATOR" || member.user.role === "MEMBER") 
          ? member.user.role 
          : "MEMBER"
      })
      setError(null)
    }
  }, [member])

  const handleSave = async () => {
    if (!member) return

    try {
      setError(null)
      const success = await onUpdate(member.id, formData)
      if (success) {
        setIsEditing(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update member")
    }
  }

  const handleDelete = async () => {
    if (!member) return

    if (!confirm(`Are you sure you want to delete ${member.user.firstName} ${member.user.lastName}? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      const success = await onDelete(member.id)
      if (success) {
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case "BASIC":
        return <Badge variant="secondary">Basic</Badge>
      case "PREMIUM":
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
      case "VIP":
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
      default:
        return <Badge variant="outline">No Tier</Badge>
    }
  }

  if (!member) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                disabled={isLoading}
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
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                {isEditing && (
                  <div>
                    <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isLoading}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "MEMBER" | "MODERATOR" | "ADMIN") => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                    disabled={!isEditing || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry (comma-separated)</Label>
                    <Input
                      id="industry"
                      value={formData.industry?.join(", ") || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        industry: e.target.value.split(",").map(i => i.trim()).filter(Boolean)
                      }))}
                      disabled={!isEditing || isLoading}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      value={formData.businessPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                    disabled={!isEditing || isLoading}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing || isLoading}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="membershipTier">Membership Tier</Label>
                    <Select
                      value={formData.membershipTier}
                      onValueChange={(value: "BASIC" | "PREMIUM" | "VIP") => 
                        setFormData(prev => ({ ...prev, membershipTier: value }))
                      }
                      disabled={!isEditing || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="membershipStatus">Membership Status</Label>
                    <Select
                      value={formData.membershipStatus}
                      onValueChange={(value: "ACTIVE" | "INACTIVE" | "SUSPENDED") => 
                        setFormData(prev => ({ ...prev, membershipStatus: value }))
                      }
                      disabled={!isEditing || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Current Status</h4>
                  <div className="flex gap-2">
                    {getTierBadge(member.membershipTier)}
                    {getStatusBadge(member.membershipStatus)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Joined: {formatDate(member.joinedAt)}</p>
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
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? "Deleting..." : "Delete Member"}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 