"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  Star, 
  Users, 
  Crown,
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Shield,
  BookOpen,
  Target,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  Send,
  ChevronRight,
  Sparkles,
  Zap,
  Heart
} from "lucide-react"

// Chapter Membership Tiers
const chapterTiers = [
  {
    id: "meeting-member",
    name: "Meeting Member",
    price: 149,
    border: "border-blue-400",
    badge: "Perfect for New Members",
    badgeColor: "bg-blue-100 text-blue-700",
    cta: "Start Networking",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
    benefits: [
      "Special Rates at BASA Networking Events for 1 Employee",
      "Directory Listing on the BASA Website",
      "Receive a New Member 'Bundle Bag'",
      "Opportunity to provide Marketing Materials for the 'Bundle Bag'",
      "Access to the BASA Private Facebook Page",
      "Receive BASA Benefits from fellow members",
      "Opportunity to provide a BASA Benefit to your fellow members",
      "Membership Certificate"
    ]
  },
  {
    id: "associate-member",
    name: "Associate Member",
    price: 245,
    border: "border-green-400",
    badge: "Most Popular",
    badgeColor: "bg-green-500 text-white",
    cta: "Join Associate",
    ctaColor: "bg-green-500 hover:bg-green-600",
    benefits: [
      "Special Rates at BASA Networking Events for 2 Employees",
      "Directory Listing on the BASA Website",
      "Receive a New Member 'Bundle Bag'",
      "Opportunity to provide Marketing Materials for the 'Bundle Bag'",
      "Access to the BASA Private Facebook Page",
      "2 shared E-Blasts per month (content provided by member)",
      "1 social media post per month (content provided by member)",
      "1 video post on social media per month (content provided by member)",
      "Receive BASA Benefits from fellow members",
      "Opportunity to provide a BASA Benefit to your fellow members",
      "Membership Certificate"
    ]
  },
  {
    id: "trio-member",
    name: "TRIO Member",
    price: 295,
    border: "border-purple-500",
    badge: "All Chapters Access",
    badgeColor: "bg-purple-500 text-white",
    cta: "Go Premium",
    ctaColor: "bg-purple-600 hover:bg-purple-700",
    benefits: [
      "Membership in ALL THREE CHAPTERS",
      "Special Rates at BASA Networking Events for 1 Employee",
      "Directory Listing on the BASA Website",
      "Receive a New Member 'Bundle Bag'",
      "Access to the BASA Private Facebook Page",
      "Opportunity to provide Marketing Materials for the 'Bundle Bag'",
      "Receive BASA Benefits from fellow members",
      "Opportunity to provide a BASA Benefit to your fellow members",
      "Membership Certificate"
    ]
  }
]

// Resource Membership Tiers
const resourceTiers = [
  {
    id: "class-resource-member",
    name: "Class Resource Member",
    price: 120,
    border: "border-blue-500",
    cta: "Join Class Resource",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
    benefits: [
      "Special rates for one at monthly training class",
      "Directory listing on the BASA Resource Page",
      "Access to BASA Resource Website & Private Facebook Page",
      "Bundle Bag - provide marketing materials",
      "Receive a BASA Bundle Bag",
      "Receive BASA Benefits from fellow BASA Members",
      "Provide a BASA Benefit to fellow BASA Members",
      "Welcome post on social media outlets"
    ]
  },
  {
    id: "nag-resource-member",
    name: "NAG Resource Member",
    price: 0,
    border: "border-red-500",
    badge: "Best Value",
    badgeColor: "bg-red-500 text-white",
    cta: "Join NAG (Networking & Giving)",
    ctaColor: "bg-red-600 hover:bg-red-700",
    benefits: [
      "As a 'Networking & Giving' NAG Member, the benefits of a Resource Member are included."
    ]
  },
  {
    id: "training-resource-member",
    name: "Training Resource Member",
    price: 225,
    border: "border-yellow-500",
    cta: "Join Training Resource",
    ctaColor: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
    benefits: [
      "Guaranteed seat for one at monthly training class",
      "Special rate for additional attendees to training classes",
      "Opportunity to be a trainer/panelist within the year",
      "Directory listing on the BASA Resource Page",
      "Access to BASA Resource Website & Private Facebook Page",
      "Bundle Bag - provide marketing materials",
      "Receive a BASA Bundle Bag",
      "Receive BASA Benefits from fellow BASA Members",
      "Provide a BASA Benefit to fellow BASA Members",
      "Welcome post on social media outlets"
    ]
  }
]

// All tiers combined for easy access
const allTiers = [...chapterTiers, ...resourceTiers]

interface CartItem {
  tierId: string
  quantity: number
  price: number
  name: string
}

interface AdditionalMember {
  id: string
  name: string
  email: string
  tierId: string
  sendInvitation: boolean
}

interface BusinessInfo {
  businessName: string
  industry: string
  businessAddress: string
  city: string
  state: string
  zipCode: string
  businessPhone: string
  website: string
  businessDescription: string
}

interface ContactInfo {
  firstName: string
  lastName: string
  jobTitle: string
  email: string
  phone: string
  linkedin: string
}

export default function JoinPage() {
  const [cart, setCart] = useState<CartItem[]>([
    {
      tierId: 'associate-member',
      quantity: 1,
      price: 245,
      name: 'Associate Member'
    }
  ])
  const [additionalMembers, setAdditionalMembers] = useState<AdditionalMember[]>([])
  const [activeTab, setActiveTab] = useState("chapter")
  const [showAdditionalMembers, setShowAdditionalMembers] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [validationAttempted, setValidationAttempted] = useState(false)
  
  // Form state
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: '',
    industry: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    businessPhone: '',
    website: '',
    businessDescription: ''
  })
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    linkedin: ''
  })

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalMemberships = cart.reduce((sum, item) => sum + item.quantity, 0)
  const hasMultipleMemberships = totalMemberships > 1

  // Validation functions
  const isBusinessInfoValid = () => {
    return businessInfo.businessName.trim() !== '' &&
           businessInfo.industry !== '' &&
           businessInfo.businessAddress.trim() !== '' &&
           businessInfo.city.trim() !== '' &&
           businessInfo.state.trim() !== '' &&
           businessInfo.zipCode.trim() !== '' &&
           businessInfo.businessPhone.trim() !== '' &&
           businessInfo.businessDescription.trim() !== ''
  }

  const isContactInfoValid = () => {
    return contactInfo.firstName.trim() !== '' &&
           contactInfo.lastName.trim() !== '' &&
           contactInfo.jobTitle.trim() !== '' &&
           contactInfo.email.trim() !== '' &&
           contactInfo.phone.trim() !== ''
  }

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return cart.length > 0
    }
    if (currentStep === 2) {
      return isBusinessInfoValid() && isContactInfoValid()
    }
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 2) {
      setValidationAttempted(true)
    }
    
    if (canProceedToNextStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleCheckout()
      }
    }
  }

  const handleCheckoutClick = () => {
    setValidationAttempted(true)
    if (canProceedToNextStep()) {
      handleCheckout()
    }
  }

  // Test function to verify button clicks
  const testButtonClick = (tierId: string, action: string) => {
    console.log('Button clicked:', { tierId, action })
  }

  // Add tier to cart
  const addToCart = (tier: any) => {
    setCart(prev => [...prev, {
      tierId: tier.id,
      quantity: 1,
      price: tier.price,
      name: tier.name
    }])
  }

  // Remove tier from cart
  const removeFromCart = (tierId: string) => {
    setCart(prev => prev.filter(item => item.tierId !== tierId))
  }

  // Update quantity for a tier
  const updateQuantity = (tierId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(tierId)
      return
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.tierId === tierId)
      if (existingItem) {
        return prev.map(item => 
          item.tierId === tierId 
            ? { ...item, quantity } 
            : item
        )
      } else {
        // Add new item if not present
        const tier = allTiers.find(t => t.id === tierId)
        if (tier) {
          return [...prev, {
            tierId: tier.id,
            quantity,
            price: tier.price,
            name: tier.name
          }]
        }
      }
      return prev
    })
  }

  // Add additional member
  const addAdditionalMember = () => {
    const newMember: AdditionalMember = {
      id: Date.now().toString(),
      name: '',
      email: '',
      tierId: cart[0]?.tierId || '',
      sendInvitation: true
    }
    setAdditionalMembers(prev => [...prev, newMember])
  }

  // Update additional member
  const updateAdditionalMember = (id: string, field: keyof AdditionalMember, value: any) => {
    setAdditionalMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    )
  }

  // Remove additional member
  const removeAdditionalMember = (id: string) => {
    setAdditionalMembers(prev => prev.filter(member => member.id !== id))
  }

  // Get tier by ID
  const getTierById = (id: string) => {
    return allTiers.find(tier => tier.id === id)
  }

  const handleCheckout = () => {
    const checkoutData = {
      cart,
      additionalMembers,
      total: subtotal
    }
    
    // Navigate to payment page with cart data
    const params = new URLSearchParams()
    params.append('cart', JSON.stringify(checkoutData))
    window.location.href = `/membership/payment?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Compact Header */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-8 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('/images/backgrounds/basa-join-bg.jpg')"
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-800/50 to-blue-700/60" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link href="/membership">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Membership
              </Link>
            </Button>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Join BASA
            </Badge>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Join San Antonio's Premier Business Network
            </h1>
            <p className="text-lg text-blue-100">
              Complete your application and start building meaningful business relationships today.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column - Membership Selection & Forms */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}>
                        1
                      </div>
                      <span className="ml-2 font-medium">Select Membership</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}>
                        2
                      </div>
                      <span className="ml-2 font-medium">Business Info</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}>
                        3
                      </div>
                      <span className="ml-2 font-medium">Checkout</span>
                    </div>
                  </div>
                </div>

                {/* Step 1: Membership Selection */}
                {currentStep === 1 && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Choose Your Membership Type
                      </CardTitle>
                      <CardDescription>
                        Select the membership that best fits your networking goals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="chapter" className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            Chapter Memberships
                          </TabsTrigger>
                          <TabsTrigger value="resource" className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Resource Memberships
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="chapter" className="mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {chapterTiers.map((tier) => {
                              const cartItem = cart.find(item => item.tierId === tier.id)
                              const quantity = cartItem?.quantity || 0
                              
                              return (
                                <div key={tier.id} className={`border-2 ${tier.border} bg-white rounded-xl p-4 hover:shadow-lg transition-all relative ${
                                  quantity > 0 ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                }`}>
                                  {tier.badge && (
                                    <div className={`absolute -top-2 right-4 px-3 py-1 rounded-full text-xs font-semibold ${tier.badgeColor}`}>
                                      {tier.badge}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                                      <span className="font-semibold text-gray-900">{tier.name}</span>
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-blue-600 mb-1">${tier.price}</div>
                                  <div className="text-sm text-gray-600 mb-3">per year</div>
                                  
                                  {/* Compact Benefits */}
                                  <div className="mb-4">
                                    <div className="text-xs text-gray-600 space-y-1">
                                      {tier.benefits.slice(0, 2).map((benefit, index) => (
                                        <div key={index} className="flex items-start">
                                          <Check className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="leading-tight">{benefit}</span>
                                        </div>
                                      ))}
                                      {tier.benefits.length > 2 && (
                                        <div className="text-blue-600 text-xs font-medium">
                                          +{tier.benefits.length - 2} more benefits
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Quantity Controls */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          testButtonClick(tier.id, 'minus')
                                          updateQuantity(tier.id, quantity - 1)
                                        }}
                                        disabled={quantity === 0}
                                        className="hover:bg-red-50 hover:border-red-300 w-8 h-8 p-0"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-8 text-center font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                                        {quantity}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          testButtonClick(tier.id, 'plus')
                                          updateQuantity(tier.id, quantity + 1)
                                        }}
                                        className="hover:bg-green-50 hover:border-green-300 w-8 h-8 p-0"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          testButtonClick(tier.id, 'remove')
                                          removeFromCart(tier.id)
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="resource" className="mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {resourceTiers.map((tier) => {
                              const cartItem = cart.find(item => item.tierId === tier.id)
                              const quantity = cartItem?.quantity || 0
                              
                              return (
                                <div key={tier.id} className={`border-2 ${tier.border} bg-white rounded-xl p-4 hover:shadow-lg transition-all relative ${
                                  quantity > 0 ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                                }`}>
                                  {tier.badge && (
                                    <div className={`absolute -top-2 right-4 px-3 py-1 rounded-full text-xs font-semibold ${tier.badgeColor}`}>
                                      {tier.badge}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                                      <span className="font-semibold text-gray-900">{tier.name}</span>
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-green-600 mb-1">
                                    {tier.price === 0 ? "Included" : `$${tier.price}`}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-3">per year</div>
                                  
                                  {/* Compact Benefits */}
                                  <div className="mb-4">
                                    <div className="text-xs text-gray-600 space-y-1">
                                      {tier.benefits.slice(0, 2).map((benefit, index) => (
                                        <div key={index} className="flex items-start">
                                          <Check className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="leading-tight">{benefit}</span>
                                        </div>
                                      ))}
                                      {tier.benefits.length > 2 && (
                                        <div className="text-green-600 text-xs font-medium">
                                          +{tier.benefits.length - 2} more benefits
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Quantity Controls */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          testButtonClick(tier.id, 'minus')
                                          updateQuantity(tier.id, quantity - 1)
                                        }}
                                        disabled={quantity === 0}
                                        className="hover:bg-red-50 hover:border-red-300 w-8 h-8 p-0"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-8 text-center font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                                        {quantity}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          testButtonClick(tier.id, 'plus')
                                          updateQuantity(tier.id, quantity + 1)
                                        }}
                                        className="hover:bg-green-50 hover:border-green-300 w-8 h-8 p-0"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          testButtonClick(tier.id, 'remove')
                                          removeFromCart(tier.id)
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Business Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl flex items-center">
                          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                          Business Information
                        </CardTitle>
                        <CardDescription>
                          Tell us about your business to help us connect you with the right opportunities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Name *
                            </label>
                            <Input 
                              placeholder="Your Business Name" 
                              value={businessInfo.businessName} 
                              onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                              className={validationAttempted && businessInfo.businessName.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Industry *
                            </label>
                            <Select value={businessInfo.industry} onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}>
                              <SelectTrigger className={validationAttempted && businessInfo.industry === '' ? 'border-red-300 focus:border-red-500' : ''}>
                                <SelectValue placeholder="Select Industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="real-estate">Real Estate</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="legal">Legal</SelectItem>
                                <SelectItem value="consulting">Consulting</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Address *
                            </label>
                            <Input 
                              placeholder="Street Address" 
                              value={businessInfo.businessAddress} 
                              onChange={(e) => setBusinessInfo({ ...businessInfo, businessAddress: e.target.value })}
                              className={validationAttempted && businessInfo.businessAddress.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <Input 
                              placeholder="San Antonio" 
                              value={businessInfo.city} 
                              onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                              className={validationAttempted && businessInfo.city.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State *
                            </label>
                            <Input 
                              placeholder="TX" 
                              value={businessInfo.state} 
                              onChange={(e) => setBusinessInfo({ ...businessInfo, state: e.target.value })}
                              className={validationAttempted && businessInfo.state.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ZIP Code *
                            </label>
                            <Input 
                              placeholder="78205" 
                              value={businessInfo.zipCode} 
                              onChange={(e) => setBusinessInfo({ ...businessInfo, zipCode: e.target.value })}
                              className={validationAttempted && businessInfo.zipCode.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Phone *
                            </label>
                            <Input 
                              placeholder="(210) 555-0123" 
                              value={businessInfo.businessPhone} 
                              onChange={(e) => setBusinessInfo({ ...businessInfo, businessPhone: e.target.value })}
                              className={validationAttempted && businessInfo.businessPhone.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Website
                            </label>
                            <Input placeholder="https://yourbusiness.com" value={businessInfo.website} onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Description *
                            </label>
                            <textarea 
                              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                validationAttempted && businessInfo.businessDescription.trim() === '' ? 'border-red-300 focus:border-red-500' : ''
                              }`}
                              rows={3}
                              placeholder="Briefly describe your business, services, and what makes you unique..."
                              value={businessInfo.businessDescription}
                              onChange={(e) => setBusinessInfo({ ...businessInfo, businessDescription: e.target.value })}
                            ></textarea>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          Primary Contact Information
                        </CardTitle>
                        <CardDescription>
                          This will be your main contact for BASA communications and networking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name *
                            </label>
                            <Input 
                              placeholder="John" 
                              value={contactInfo.firstName} 
                              onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                              className={validationAttempted && contactInfo.firstName.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name *
                            </label>
                            <Input 
                              placeholder="Doe" 
                              value={contactInfo.lastName} 
                              onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                              className={validationAttempted && contactInfo.lastName.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Job Title *
                            </label>
                            <Input 
                              placeholder="CEO, Owner, Manager, etc." 
                              value={contactInfo.jobTitle} 
                              onChange={(e) => setContactInfo({ ...contactInfo, jobTitle: e.target.value })}
                              className={validationAttempted && contactInfo.jobTitle.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <Input 
                              type="email" 
                              placeholder="john@yourbusiness.com" 
                              value={contactInfo.email} 
                              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                              className={validationAttempted && contactInfo.email.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <Input 
                              placeholder="(210) 555-0123" 
                              value={contactInfo.phone} 
                              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                              className={validationAttempted && contactInfo.phone.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              LinkedIn Profile
                            </label>
                            <Input placeholder="https://linkedin.com/in/johndoe" value={contactInfo.linkedin} onChange={(e) => setContactInfo({ ...contactInfo, linkedin: e.target.value })} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 3: Additional Members */}
                {currentStep === 3 && hasMultipleMemberships && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                        Assign Additional Memberships
                      </CardTitle>
                      <CardDescription>
                        Provide information for employees or friends who will use the additional memberships
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {additionalMembers.map((member, index) => (
                          <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Additional Member {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeAdditionalMember(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Full Name *
                                </label>
                                <Input
                                  placeholder="Enter full name"
                                  value={member.name}
                                  onChange={(e) => updateAdditionalMember(member.id, 'name', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email Address *
                                </label>
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
                                  value={member.email}
                                  onChange={(e) => updateAdditionalMember(member.id, 'email', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`send-invitation-${member.id}`}
                                checked={member.sendInvitation}
                                onCheckedChange={(checked) => 
                                  updateAdditionalMember(member.id, 'sendInvitation', checked)
                                }
                              />
                              <label 
                                htmlFor={`send-invitation-${member.id}`}
                                className="text-sm text-gray-700 flex items-center"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Send invitation email to activate account
                              </label>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          onClick={addAdditionalMember}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another Member
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-4">
                    {currentStep === 2 && validationAttempted && !canProceedToNextStep() && (
                      <div className="text-sm text-red-600 flex items-center">
                        <span>Please fill out all required fields</span>
                      </div>
                    )}
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {currentStep === 3 ? (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Proceed to Checkout
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Sticky Order Summary */}
              <div className="xl:col-span-1">
                <div className="sticky top-8">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                        Order Summary
                      </CardTitle>
                      {cart.length > 0 && (
                        <CardDescription>
                          {totalMemberships} membership{totalMemberships !== 1 ? 's' : ''} selected
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No memberships selected</p>
                          <p className="text-sm">Choose your membership type above</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Cart Items */}
                          {cart.map((item) => (
                            <div key={item.tierId} className="border-b border-gray-200 pb-3">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                  <p className="text-xs text-gray-500">${item.price} each</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          <Separator />

                          {/* Totals */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Annual Fee</span>
                              <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Total</span>
                              <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-600">Billed annually</p>
                          </div>
                          
                          {/* Multiple Memberships Notice */}
                          {hasMultipleMemberships && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-1 flex items-center text-sm">
                                <UserPlus className="w-4 h-4 mr-1" />
                                Multiple Memberships
                              </h4>
                              <p className="text-xs text-blue-800">
                                You can assign additional memberships to employees or friends.
                              </p>
                            </div>
                          )}

                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-1 text-sm flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              Welcome Bonus
                            </h4>
                            <p className="text-xs text-green-800">
                              Get your first month FREE when you join today!
                            </p>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-1 text-sm flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              Secure Payment
                            </h4>
                            <p className="text-xs text-blue-800">
                              Your payment information is encrypted and secure.
                            </p>
                          </div>

                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleCheckoutClick}
                            disabled={!canProceedToNextStep()}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {cart.length === 0 ? 'Select Memberships' : 'Proceed to Checkout'}
                          </Button>

                          {/* Validation Message */}
                          {cart.length > 0 && !canProceedToNextStep() && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                              <div className="text-sm text-red-800 flex items-center">
                                <span className="font-medium">⚠️ Complete Required Information</span>
                              </div>
                              <p className="text-xs text-red-700 mt-1">
                                Please fill out all required business and contact information before proceeding to checkout.
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 text-center">
                            By completing registration, you agree to our Terms of Service and Privacy Policy.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Benefits Section */}
      {/* <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center justify-center">
              <Heart className="w-6 h-6 mr-2 text-red-500" />
              What You'll Get as a BASA Member
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Networking Opportunities</h3>
                <p className="text-sm text-gray-600">Connect with local business leaders and build meaningful relationships</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Growth</h3>
                <p className="text-sm text-gray-600">Access resources, training, and opportunities to grow your business</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community Impact</h3>
                <p className="text-sm text-gray-600">Give back to the San Antonio community through charitable initiatives</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
} 