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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const { profile, loading, error, saving, updateProfile, getProfileCompletion, getProfileCompletionDetails, getNetworkingStats } = useProfile()
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [newIndustry, setNewIndustry] = useState("")
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [showCertificationDropdown, setShowCertificationDropdown] = useState(false)
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)

  // Predefined lists for suggestions
  const commonServices = [
    "Web Development", "Mobile App Development", "UI/UX Design", "Digital Marketing", 
    "SEO Optimization", "Content Creation", "Social Media Management", "Graphic Design",
    "Video Production", "Photography", "Consulting", "Project Management", "Data Analysis",
    "Cloud Solutions", "IT Support", "E-commerce", "Brand Strategy", "Public Relations",
    "Event Planning", "Legal Services", "Accounting", "Financial Planning", "Real Estate",
    "Insurance", "Healthcare", "Education", "Training", "Coaching", "Translation",
    "Virtual Assistant", "Bookkeeping", "Tax Preparation", "Business Strategy"
  ]

  const commonCertifications = [
    "AWS Certified", "Google Cloud Professional", "Microsoft Certified", "Cisco Certified",
    "PMP (Project Management Professional)", "Six Sigma", "Lean Management", "Scrum Master",
    "Agile Coach", "Certified Public Accountant", "Certified Financial Planner",
    "Real Estate License", "Insurance License", "Bar License", "Medical License",
    "Teaching Certificate", "Adobe Certified Expert", "Google Ads Certified",
    "Facebook Blueprint", "HubSpot Certified", "Salesforce Certified", "QuickBooks ProAdvisor",
    "Certified Management Consultant", "Chamber Management Professional", "Leadership Development"
  ]

  const commonIndustries = [
    "Technology", "Healthcare", "Finance", "Education", "Real Estate", "Manufacturing",
    "Retail", "Hospitality", "Transportation", "Construction", "Legal", "Marketing",
    "Advertising", "Media", "Entertainment", "Food & Beverage", "Fitness & Wellness",
    "Non-Profit", "Government", "Consulting", "Insurance", "Automotive", "Fashion",
    "Beauty", "Sports", "Travel", "Energy", "Telecommunications", "Pharmaceuticals",
    "Biotechnology", "Aerospace", "Defense", "Agriculture", "Mining", "Utilities"
  ]

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format based on length
    if (phoneNumber.length === 0) return ''
    if (phoneNumber.length <= 3) return `(${phoneNumber}`
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange('personalPhone', formatted)
  }

  const handleBusinessPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange('businessPhone', formatted)
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      handleArrayChange('specialties', newSpecialty.trim(), 'add')
      setNewSpecialty("")
    }
  }

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      handleArrayChange('certifications', newCertification.trim(), 'add')
      setNewCertification("")
    }
  }

  const handleAddIndustry = () => {
    if (newIndustry.trim()) {
      handleArrayChange('industry', newIndustry.trim(), 'add')
      setNewIndustry("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, addFunction: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFunction()
    }
  }

  const getFilteredServices = () => {
    if (!newSpecialty.trim()) return commonServices
    return commonServices.filter(service => 
      service.toLowerCase().includes(newSpecialty.toLowerCase())
    )
  }

  const getFilteredCertifications = () => {
    if (!newCertification.trim()) return commonCertifications
    return commonCertifications.filter(cert => 
      cert.toLowerCase().includes(newCertification.toLowerCase())
    )
  }

  const getFilteredIndustries = () => {
    if (!newIndustry.trim()) return commonIndustries
    return commonIndustries.filter(industry => 
      industry.toLowerCase().includes(newIndustry.toLowerCase())
    )
  }

  const handleServiceSelect = (service: string) => {
    handleArrayChange('specialties', service, 'add')
    setNewSpecialty("")
    setShowServiceDropdown(false)
  }

  const handleCertificationSelect = (certification: string) => {
    handleArrayChange('certifications', certification, 'add')
    setNewCertification("")
    setShowCertificationDropdown(false)
  }

  const handleIndustrySelect = (industry: string) => {
    handleArrayChange('industry', industry, 'add')
    setNewIndustry("")
    setShowIndustryDropdown(false)
  }

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
        personalPhone: profile.member?.businessPhone || "",
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

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setShowServiceDropdown(false)
        setShowCertificationDropdown(false)
        setShowIndustryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (field: keyof UpdateProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasUnsavedChanges(true)
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
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    try {
      const result = await updateProfile(formData)
      if (result) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
        setHasUnsavedChanges(false)
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
        personalPhone: profile.member?.businessPhone || "",
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
    setHasUnsavedChanges(false)
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
                      value={`${formData.firstName || ""} ${formData.lastName || ""}`.trim()}
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
                      value={formData.businessName || ""}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Business Name"
                      className="text-gray-600 h-6 border-0 p-0 bg-transparent focus:ring-0 focus:border-b-2 focus:border-blue-500"
                    />
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
                  <Input
                    id="company"
                    value={formData.businessName || ""}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Industry Type</Label>
                  <Select value={formData.businessType || ""} onValueChange={(value) => handleInputChange('businessType', value)}>
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
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Personal Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.personalPhone || ""}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  value={formData.description || ""}
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
                    value={formData.businessEmail || ""}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="Enter business email"
                  />
                </div>
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={formData.businessPhone || ""}
                    onChange={(e) => handleBusinessPhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ""}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin || ""}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.businessAddress || ""}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Enter business address"
                  />
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0"
                          onClick={() => handleArrayChange('specialties', specialty, 'remove')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {!showServiceDropdown ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowServiceDropdown(true)}
                      className="mt-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Service
                    </Button>
                  ) : (
                    <div className="relative mt-2 dropdown-container">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => {
                          setNewSpecialty(e.target.value)
                        }}
                        onKeyPress={(e) => handleKeyPress(e, handleAddSpecialty)}
                        onFocus={() => setShowServiceDropdown(true)}
                        placeholder="Type to search or add a service..."
                        className="w-80"
                      />
                      {showServiceDropdown && (newSpecialty.trim() || getFilteredServices().length > 0) && (
                        <div className="absolute z-10 w-80 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredServices().map((service, index) => (
                            <button
                              key={index}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              onClick={() => handleServiceSelect(service)}
                            >
                              {service}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.certifications || []).map((certification, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        {certification}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0"
                          onClick={() => handleArrayChange('certifications', certification, 'remove')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {!showCertificationDropdown ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCertificationDropdown(true)}
                      className="mt-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Expertise
                    </Button>
                  ) : (
                    <div className="relative mt-2 dropdown-container">
                      <Input
                        value={newCertification}
                        onChange={(e) => {
                          setNewCertification(e.target.value)
                        }}
                        onKeyPress={(e) => handleKeyPress(e, handleAddCertification)}
                        onFocus={() => setShowCertificationDropdown(true)}
                        placeholder="Type to search or add an expertise area..."
                        className="w-80"
                      />
                      {showCertificationDropdown && (newCertification.trim() || getFilteredCertifications().length > 0) && (
                        <div className="absolute z-10 w-80 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredCertifications().map((certification, index) => (
                            <button
                              key={index}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              onClick={() => handleCertificationSelect(certification)}
                            >
                              {certification}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Industries Served</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.industry || []).map((industry, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        {industry}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0"
                          onClick={() => handleArrayChange('industry', industry, 'remove')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {!showIndustryDropdown ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowIndustryDropdown(true)}
                      className="mt-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Industry
                    </Button>
                  ) : (
                    <div className="relative mt-2 dropdown-container">
                      <Input
                        value={newIndustry}
                        onChange={(e) => {
                          setNewIndustry(e.target.value)
                        }}
                        onKeyPress={(e) => handleKeyPress(e, handleAddIndustry)}
                        onFocus={() => setShowIndustryDropdown(true)}
                        placeholder="Type to search or add an industry..."
                        className="w-80"
                      />
                      {showIndustryDropdown && (newIndustry.trim() || getFilteredIndustries().length > 0) && (
                        <div className="absolute z-10 w-80 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredIndustries().map((industry, index) => (
                            <button
                              key={index}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              onClick={() => handleIndustrySelect(industry)}
                            >
                              {industry}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                <Switch
                  checked={formData.showInDirectory ?? true}
                  onCheckedChange={(checked) => handleInputChange('showInDirectory', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Contact</Label>
                  <p className="text-sm text-gray-500">Allow other members to contact you directly</p>
                </div>
                <Switch
                  checked={formData.allowContact ?? true}
                  onCheckedChange={(checked) => handleInputChange('allowContact', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Address</Label>
                  <p className="text-sm text-gray-500">Display your business address to other members</p>
                </div>
                <Switch
                  checked={formData.showAddress ?? false}
                  onCheckedChange={(checked) => handleInputChange('showAddress', checked)}
                />
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
    </div>
  )
} 