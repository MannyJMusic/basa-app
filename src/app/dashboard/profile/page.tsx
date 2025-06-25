"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useProfile, UpdateProfileData } from "@/hooks/use-profile"
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
  const { profile, loading, error, saving, updateProfile, getProfileCompletion, getNetworkingStats } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileData>({})

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        businessName: profile.member?.businessName || "",
        businessType: profile.member?.businessType || "",
        industry: profile.member?.industry || [],
        businessEmail: profile.member?.businessEmail || "",
        businessPhone: profile.member?.businessPhone || "",
        businessAddress: profile.member?.businessAddress || "",
        city: profile.member?.city || "",
        state: profile.member?.state || "",
        zipCode: profile.member?.zipCode || "",
        website: profile.member?.website || "",
        description: profile.member?.description || "",
        tagline: profile.member?.tagline || "",
        specialties: profile.member?.specialties || [],
        certifications: profile.member?.certifications || [],
        linkedin: profile.member?.linkedin || "",
        facebook: profile.member?.facebook || "",
        instagram: profile.member?.instagram || "",
        twitter: profile.member?.twitter || "",
        youtube: profile.member?.youtube || "",
        showInDirectory: profile.member?.showInDirectory ?? true,
        allowContact: profile.member?.allowContact ?? true,
        showAddress: profile.member?.showAddress ?? false,
      })
    }
  }, [profile])

  const handleInputChange = (field: keyof UpdateProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: keyof UpdateProfileData, value: string, action: 'add' | 'remove') => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || []
      if (action === 'add') {
        return {
          ...prev,
          [field]: [...currentArray, value]
        }
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        }
      }
    })
  }

  const handleSave = async () => {
    try {
      const result = await updateProfile(formData)
      if (result) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
        setIsEditing(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        businessName: profile.member?.businessName || "",
        businessType: profile.member?.businessType || "",
        industry: profile.member?.industry || [],
        businessEmail: profile.member?.businessEmail || "",
        businessPhone: profile.member?.businessPhone || "",
        businessAddress: profile.member?.businessAddress || "",
        city: profile.member?.city || "",
        state: profile.member?.state || "",
        zipCode: profile.member?.zipCode || "",
        website: profile.member?.website || "",
        description: profile.member?.description || "",
        tagline: profile.member?.tagline || "",
        specialties: profile.member?.specialties || [],
        certifications: profile.member?.certifications || [],
        linkedin: profile.member?.linkedin || "",
        facebook: profile.member?.facebook || "",
        instagram: profile.member?.instagram || "",
        twitter: profile.member?.twitter || "",
        youtube: profile.member?.youtube || "",
        showInDirectory: profile.member?.showInDirectory ?? true,
        allowContact: profile.member?.allowContact ?? true,
        showAddress: profile.member?.showAddress ?? false,
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  const networkingStats = getNetworkingStats()
  const completionPercentage = getProfileCompletion()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional profile and networking presence</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
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
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
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
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.image ? (
                    <img 
                      src={profile.image} 
                      alt={`${profile.firstName || 'User'} ${profile.lastName || 'Profile'}`} 
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className={`w-10 h-10 text-blue-600 ${profile.image ? 'hidden' : ''}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {isEditing ? (
                      <Input
                        value={formData.firstName || ""}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First Name"
                        className="text-2xl font-bold h-8"
                      />
                    ) : (
                      `${profile.firstName || 'First'} ${profile.lastName || 'Last'}`
                    )}
                  </h2>
                  <p className="text-gray-600">
                    {isEditing ? (
                      <Input
                        value={formData.businessName || ""}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="Business Name"
                        className="text-gray-600 h-6"
                      />
                    ) : (
                      profile.member?.businessName || "Business Owner"
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {profile.member?.membershipTier || "BASIC"} Member
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {profile.member?.membershipStatus === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={formData.businessName || ""}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter company name"
                    />
                  ) : (
                    <Input id="company" value={profile.member?.businessName || ""} readOnly />
                  )}
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  {isEditing ? (
                    <Select value={formData.businessType || ""} onValueChange={(value) => handleInputChange('businessType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="nonprofit">Non-Profit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="businessType" value={profile.member?.businessType || ""} readOnly />
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  ) : (
                    <Input id="email" type="email" value={profile.email || ""} readOnly />
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.businessPhone || ""}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <Input id="phone" type="tel" value={profile.member?.businessPhone || ""} readOnly />
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                {isEditing ? (
                  <Textarea 
                    id="bio" 
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about your professional background and expertise..."
                    rows={4}
                  />
                ) : (
                  <Textarea 
                    id="bio" 
                    value={profile.member?.description || ""}
                    rows={4}
                    readOnly
                  />
                )}
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
                  {isEditing ? (
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail || ""}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      placeholder="Enter business email"
                    />
                  ) : (
                    <Input id="businessEmail" type="email" value={profile.member?.businessEmail || ""} readOnly />
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={formData.website || ""}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <Input id="website" value={profile.member?.website || ""} readOnly />
                  )}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin"
                      value={formData.linkedin || ""}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : (
                    <Input id="linkedin" value={profile.member?.linkedin || ""} readOnly />
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Business Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.businessAddress || ""}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                      placeholder="Enter business address"
                    />
                  ) : (
                    <Input id="address" value={profile.member?.businessAddress || ""} readOnly />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services & Expertise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Services & Expertise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Services Offered</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.specialties || []).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        {specialty}
                        {isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0"
                            onClick={() => handleArrayChange('specialties', specialty, 'remove')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6"
                        onClick={() => {
                          const newSpecialty = prompt("Enter a new service:")
                          if (newSpecialty) {
                            handleArrayChange('specialties', newSpecialty, 'add')
                          }
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Service
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.certifications || []).map((certification, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        {certification}
                        {isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0"
                            onClick={() => handleArrayChange('certifications', certification, 'remove')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6"
                        onClick={() => {
                          const newCertification = prompt("Enter a new certification:")
                          if (newCertification) {
                            handleArrayChange('certifications', newCertification, 'add')
                          }
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Expertise
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Industries Served</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.industry || []).map((industry, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        {industry}
                        {isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0"
                            onClick={() => handleArrayChange('industry', industry, 'remove')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6"
                        onClick={() => {
                          const newIndustry = prompt("Enter a new industry:")
                          if (newIndustry) {
                            handleArrayChange('industry', newIndustry, 'add')
                          }
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Industry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
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
                {isEditing ? (
                  <Switch
                    checked={formData.showInDirectory ?? true}
                    onCheckedChange={(checked) => handleInputChange('showInDirectory', checked)}
                  />
                ) : (
                  <Badge variant={profile.member?.showInDirectory ? "default" : "secondary"}>
                    {profile.member?.showInDirectory ? "Visible" : "Hidden"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Contact</Label>
                  <p className="text-sm text-gray-500">Allow other members to contact you directly</p>
                </div>
                {isEditing ? (
                  <Switch
                    checked={formData.allowContact ?? true}
                    onCheckedChange={(checked) => handleInputChange('allowContact', checked)}
                  />
                ) : (
                  <Badge variant={profile.member?.allowContact ? "default" : "secondary"}>
                    {profile.member?.allowContact ? "Allowed" : "Blocked"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Address</Label>
                  <p className="text-sm text-gray-500">Display your business address to other members</p>
                </div>
                {isEditing ? (
                  <Switch
                    checked={formData.showAddress ?? false}
                    onCheckedChange={(checked) => handleInputChange('showAddress', checked)}
                  />
                ) : (
                  <Badge variant={profile.member?.showAddress ? "default" : "secondary"}>
                    {profile.member?.showAddress ? "Visible" : "Hidden"}
                  </Badge>
                )}
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
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contact Information</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Services & Expertise</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Professional Experience</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Education</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Profile Complete!</p>
                <p className="text-xs text-green-600">Your profile is {completionPercentage}% complete</p>
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
    </div>
  )
} 