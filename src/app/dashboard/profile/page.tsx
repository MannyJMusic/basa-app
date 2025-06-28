"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Edit,
  Save,
  Award,
  Star,
  Users,
  Handshake,
  Calendar,
  Target,
  Heart,
  TrendingUp,
  CheckCircle,
  Plus,
  X,
  Loader2,
  AlertCircle
} from "lucide-react"

export default function DashboardProfilePage() {
  const { toast } = useToast()
  const { profile, loading, error, saving, updateProfile, getProfileCompletion, getProfileCompletionDetails, getNetworkingStats } = useProfile()
  const { data: session } = useSession()
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Determine if user is guest
  const isGuest = session?.user?.role === "GUEST" || profile?.role === "GUEST"

  // Handler functions
  const handleInputChange = (field: keyof UpdateProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!profile) return
    
    const result = await updateProfile(formData)
    if (result) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      setHasUnsavedChanges(false)
    }
  }

  const handleCancel = () => {
    setFormData({})
    setHasUnsavedChanges(false)
  }

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error loading profile:</strong> {error}
        </div>
      </div>
    )
  }

  // Show empty state if no profile data
  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>No profile data available.</strong> Please try refreshing the page.
        </div>
      </div>
    )
  }

  const networkingStats = getNetworkingStats()
  const completionPercentage = getProfileCompletion()
  const completionDetails = getProfileCompletionDetails()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional profile and networking presence</p>
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
              <Button variant="outline" onClick={handleCancel}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
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
                    alt={`${profile.firstName || 'User'} ${profile.lastName || 'Profile'}`}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                    {profile.firstName?.charAt(0) || 'U'}{profile.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    <Input
                      value={`${formData.firstName || profile.firstName || ""} ${formData.lastName || profile.lastName || ""}`.trim()}
                      onChange={(e) => {
                        const fullName = e.target.value
                        const nameParts = fullName.split(' ')
                        const firstName = nameParts[0] || ""
                        const lastName = nameParts.slice(1).join(' ') || ""
                        handleInputChange('firstName', firstName)
                        handleInputChange('lastName', lastName)
                      }}
                      placeholder="First Last"
                      className="text-2xl font-bold h-8 border-0 p-0 bg-transparent focus:ring-0 focus:border-b-2 focus:border-blue-500"
                    />
                  </h2>
                  <p className="text-gray-600">
                    <Input
                      value={formData.businessName || profile.member?.businessName || ""}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Business Name"
                      className="text-gray-600 h-6 border-0 p-0 bg-transparent focus:ring-0 focus:border-b-2 focus:border-blue-500"
                    />
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={formData.businessType || profile.member?.businessType || ""} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Accounting">Accounting</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Hospitality">Hospitality</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Fitness & Wellness">Fitness & Wellness</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || profile.email || ""}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  value={formData.description || profile.member?.description || ""}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your professional background and expertise..."
                  rows={4}
                />
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
                    value={formData.businessEmail || profile.member?.businessEmail || ""}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="Enter business email"
                  />
                </div>
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={formData.businessPhone || profile.member?.businessPhone || ""}
                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || profile.member?.website || ""}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin || profile.member?.linkedin || ""}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.businessAddress || profile.member?.businessAddress || ""}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Enter business address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Networking Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Connections</span>
                </div>
                <span className="font-bold">{networkingStats.connections}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Handshake className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Meetings</span>
                </div>
                <span className="font-bold">{networkingStats.meetings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Events Attended</span>
                </div>
                <span className="font-bold">{networkingStats.eventsAttended}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm">Referrals Given</span>
                </div>
                <span className="font-bold">{networkingStats.referralsGiven}</span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic Information</span>
                  {completionDetails.basicInfo ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contact Information</span>
                  {completionDetails.contactInfo ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Services & Expertise</span>
                  {completionDetails.servicesExpertise ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Business Details</span>
                  {completionDetails.businessDetails ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Social Media</span>
                  {completionDetails.socialMedia ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg ${
                completionDetails.overall === 100 
                  ? 'bg-green-50' 
                  : completionDetails.overall >= 80 
                  ? 'bg-yellow-50' 
                  : 'bg-red-50'
              }`}>
                <p className={`text-sm font-medium ${
                  completionDetails.overall === 100 
                    ? 'text-green-800' 
                    : completionDetails.overall >= 80 
                    ? 'text-yellow-800' 
                    : 'text-red-800'
                }`}>
                  {completionDetails.overall === 100 
                    ? 'Profile Complete!' 
                    : completionDetails.overall >= 80 
                    ? 'Almost Complete!' 
                    : 'Profile Incomplete'}
                </p>
                <p className={`text-xs ${
                  completionDetails.overall === 100 
                    ? 'text-green-600' 
                    : completionDetails.overall >= 80 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  Your profile is {completionDetails.overall}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
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
                <Link href="/dashboard/resources">Access Resources</Link>
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
            <CardDescription>Control how your information appears to other members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show in Directory</Label>
                <p className="text-sm text-gray-500">Allow other members to find you in the member directory</p>
              </div>
              <Switch
                checked={isGuest ? false : (formData.showInDirectory ?? profile.member?.showInDirectory ?? true)}
                onCheckedChange={(checked) => handleInputChange('showInDirectory', checked)}
                disabled={isGuest}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Contact</Label>
                <p className="text-sm text-gray-500">Allow other members to contact you directly</p>
              </div>
              <Switch
                checked={isGuest ? false : (formData.allowContact ?? profile.member?.allowContact ?? true)}
                onCheckedChange={(checked) => handleInputChange('allowContact', checked)}
                disabled={isGuest}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Address</Label>
                <p className="text-sm text-gray-500">Display your business address to other members</p>
              </div>
              <Switch
                checked={isGuest ? false : (formData.showAddress ?? profile.member?.showAddress ?? false)}
                onCheckedChange={(checked) => handleInputChange('showAddress', checked)}
                disabled={isGuest}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 