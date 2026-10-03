"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useProfile, UpdateProfileData } from "@/hooks/use-profile"
import { useSession } from "next-auth/react"
import {
  User,
  Mail,
  Save,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react"

type TextField =
  | "firstName" | "lastName" | "email" | "businessName" | "businessType" | "description"
  | "businessEmail" | "businessPhone" | "website" | "linkedin" | "businessAddress"
  | "city" | "state" | "zipCode"

const USER_FIELDS = new Set<string>(["firstName", "lastName", "email"])

const BUSINESS_TYPES = [
  "Technology", "Consulting", "Marketing", "Construction", "Real Estate", "Accounting",
  "Design", "Healthcare", "Education", "Legal", "Financial Services", "Insurance",
  "Manufacturing", "Retail", "Hospitality", "Transportation", "Non-Profit", "Government",
  "Media", "Food & Beverage", "Fitness & Wellness", "Other",
]

export default function DashboardProfilePage() {
  const { toast } = useToast()
  const { profile, loading, error, saveError, fieldErrors, saving, updateProfile, getProfileCompletionDetails } = useProfile()
  const { data: session } = useSession()
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const isGuest = session?.user?.role === "GUEST" || profile?.role === "GUEST"

  /** The edited value if the field was touched (even to ""), else the saved one. */
  const value = (field: TextField): string => {
    const edited = formData[field]
    if (edited !== undefined) return edited ?? ""
    if (!profile) return ""
    if (field === "firstName" || field === "lastName" || field === "email") {
      return profile[field] ?? ""
    }
    const member = profile.member as Record<string, unknown> | undefined
    return (member?.[field] as string | null | undefined) ?? ""
  }

  const handleInputChange = (field: keyof UpdateProfileData, newValue: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: newValue }))
    setHasUnsavedChanges(true)
  }

  const fieldError = (field: string) =>
    fieldErrors[field] ? <p className="text-sm text-red-600 mt-1">{fieldErrors[field]}</p> : null

  const handleSave = async () => {
    if (!profile) return

    // A cleared optional field is sent as null so the server clears it.
    const payload: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(formData)) {
      payload[key] = typeof v === "string" && v.trim() === "" && !USER_FIELDS.has(key) ? null : v
    }

    const result = await updateProfile(payload as UpdateProfileData)
    if (result) {
      const pending = result.emailChangePending
      toast({
        title: "Profile updated",
        description: pending
          ? `We sent a link to ${pending}. Your email changes when you click it (within 24 hours); until then, keep signing in with your current address.`
          : "Your profile has been successfully updated.",
      })
      setFormData({})
      setHasUnsavedChanges(false)
    } else {
      toast({
        title: "Profile not saved",
        description: "Please check the form and try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setFormData({})
    setHasUnsavedChanges(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Loading failed: there is nothing to edit.
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error loading profile:</strong> {error}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>No profile data available.</strong> Please try refreshing the page.
        </div>
      </div>
    )
  }

  const completionDetails = getProfileCompletionDetails()
  const firstName = value("firstName")
  const lastName = value("lastName")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional profile and how other members see you</p>
          {hasUnsavedChanges && (
            <p className="text-sm text-orange-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              You have unsaved changes
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel Changes
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <div role="alert" className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          <strong>Your changes were not saved.</strong> {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={profile.image}
                    alt={`${firstName || "User"} ${lastName || "Profile"}`}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                    {firstName.charAt(0) || "U"}{lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      autoComplete="given-name"
                    />
                    {fieldError("firstName")}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      autoComplete="family-name"
                    />
                    {fieldError("lastName")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={value("businessName")}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Business name"
                  />
                  {fieldError("businessName")}
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={value("businessType")} onValueChange={(v) => handleInputChange("businessType", v)}>
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select industry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("businessType")}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Sign-in Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={value("email")}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">A new address only takes effect after you confirm the link we email to it.</p>
                  {fieldError("email")}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={value("description")}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Tell other members about your business and expertise..."
                  rows={4}
                />
                {fieldError("description")}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={value("businessEmail")}
                    onChange={(e) => handleInputChange("businessEmail", e.target.value)}
                    placeholder="Enter business email"
                  />
                  {fieldError("businessEmail")}
                </div>
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={value("businessPhone")}
                    onChange={(e) => handleInputChange("businessPhone", e.target.value)}
                    placeholder="(210) 555-0100"
                  />
                  {fieldError("businessPhone")}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={value("website")}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="yourwebsite.com"
                  />
                  {fieldError("website")}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={value("linkedin")}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                  {fieldError("linkedin")}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={value("businessAddress")}
                    onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                    placeholder="Street address"
                  />
                  {fieldError("businessAddress")}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={value("city")}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                  {fieldError("city")}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={value("state")}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                    {fieldError("state")}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP</Label>
                    <Input
                      id="zipCode"
                      value={value("zipCode")}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    />
                    {fieldError("zipCode")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {([
                  ["Basic Information", completionDetails.basicInfo],
                  ["Contact Information", completionDetails.contactInfo],
                  ["Services & Expertise", completionDetails.servicesExpertise],
                  ["Business Details", completionDetails.businessDetails],
                  ["Social Media", completionDetails.socialMedia],
                ] as const).map(([label, done]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-3 rounded-lg ${
                completionDetails.overall === 100
                  ? "bg-green-50"
                  : completionDetails.overall >= 80
                  ? "bg-yellow-50"
                  : "bg-red-50"
              }`}>
                <p className={`text-sm font-medium ${
                  completionDetails.overall === 100
                    ? "text-green-800"
                    : completionDetails.overall >= 80
                    ? "text-yellow-800"
                    : "text-red-800"
                }`}>
                  {completionDetails.overall === 100
                    ? "Profile Complete!"
                    : completionDetails.overall >= 80
                    ? "Almost Complete!"
                    : "Profile Incomplete"}
                </p>
                <p className="text-xs text-gray-600">
                  Your profile is {completionDetails.overall}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/directory">Browse Directory</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/events">View Events</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/account">Account Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Privacy Settings - only for non-guests */}
      {!isGuest && (
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control how your information appears to other members. Save your changes with the button at the top.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showInDirectory">Show in Directory</Label>
                <p className="text-sm text-gray-500">Allow other members to find you in the member directory</p>
              </div>
              <Switch
                id="showInDirectory"
                checked={formData.showInDirectory ?? profile.member?.showInDirectory ?? false}
                onCheckedChange={(checked) => handleInputChange("showInDirectory", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowContact">Allow Contact</Label>
                <p className="text-sm text-gray-500">Show your business email and phone to other members</p>
              </div>
              <Switch
                id="allowContact"
                checked={formData.allowContact ?? profile.member?.allowContact ?? false}
                onCheckedChange={(checked) => handleInputChange("allowContact", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showAddress">Show Address</Label>
                <p className="text-sm text-gray-500">Display your business address to other members</p>
              </div>
              <Switch
                id="showAddress"
                checked={formData.showAddress ?? profile.member?.showAddress ?? false}
                onCheckedChange={(checked) => handleInputChange("showAddress", checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
