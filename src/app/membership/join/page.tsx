import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Shield
} from "lucide-react"

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 mr-4">
              <Link href="/membership">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Membership
              </Link>
            </Button>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Join BASA
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join San Antonio's Premier Business Network
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Complete your application and start building meaningful business relationships today.
            </p>
          </div>
        </div>
      </section>

      {/* Join Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Membership Selection */}
              <div className="lg:col-span-2">
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Select Your Membership Tier</CardTitle>
                    <CardDescription>
                      Choose the tier that best fits your business goals and networking needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Essential */}
                      <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-semibold">Essential</span>
                          </div>
                          <input type="radio" name="tier" value="essential" className="text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-1">$200</div>
                        <div className="text-sm text-gray-600 mb-3">per year</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• 50% event discount</li>
                          <li>• Directory listing</li>
                          <li>• Basic resources</li>
                        </ul>
                      </div>

                      {/* Professional */}
                      <div className="border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="font-semibold">Professional</span>
                          </div>
                          <input type="radio" name="tier" value="professional" className="text-purple-600" defaultChecked />
                        </div>
                        <div className="text-2xl font-bold text-purple-600 mb-1">$400</div>
                        <div className="text-sm text-gray-600 mb-3">per year</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• All Essential benefits</li>
                          <li>• Enhanced profile</li>
                          <li>• Priority registration</li>
                        </ul>
                      </div>

                      {/* Corporate */}
                      <div className="border-2 border-yellow-200 rounded-lg p-4 hover:border-yellow-400 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="font-semibold">Corporate</span>
                          </div>
                          <input type="radio" name="tier" value="corporate" className="text-yellow-600" />
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 mb-1">$750</div>
                        <div className="text-sm text-gray-600 mb-3">per year</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• All Professional benefits</li>
                          <li>• Website placement</li>
                          <li>• Speaking opportunities</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Information */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Business Information</CardTitle>
                    <CardDescription>
                      Tell us about your business to help us connect you with the right opportunities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name *
                        </label>
                        <Input placeholder="Your Business Name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry *
                        </label>
                        <Select>
                          <SelectTrigger>
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
                        <Input placeholder="Street Address" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <Input placeholder="San Antonio" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <Input placeholder="TX" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <Input placeholder="78205" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Phone *
                        </label>
                        <Input placeholder="(210) 555-0123" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <Input placeholder="https://yourbusiness.com" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Description *
                        </label>
                        <textarea 
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Briefly describe your business, services, and what makes you unique..."
                        ></textarea>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Contact */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Primary Contact Information</CardTitle>
                    <CardDescription>
                      This will be your main contact for BASA communications and networking.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input placeholder="Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <Input placeholder="CEO, Owner, Manager, etc." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input type="email" placeholder="john@yourbusiness.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input placeholder="(210) 555-0123" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn Profile
                        </label>
                        <Input placeholder="https://linkedin.com/in/johndoe" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Additional Information</CardTitle>
                    <CardDescription>
                      Help us understand your networking goals and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          How did you hear about BASA? *
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="search">Online Search</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="referral">Member Referral</SelectItem>
                            <SelectItem value="event">Attended an Event</SelectItem>
                            <SelectItem value="advertising">Advertising</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What are your primary networking goals? *
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Generate new business leads</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Build referral partnerships</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Learn from industry experts</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Give back to the community</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Expand professional network</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Any specific industries you'd like to connect with?
                        </label>
                        <textarea 
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="e.g., Technology, Healthcare, Real Estate..."
                        ></textarea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Professional Membership</span>
                        <span className="font-semibold">$400</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Annual Fee</span>
                        <span className="font-semibold">$400</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total</span>
                          <span>$400</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Billed annually</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">🎉 Welcome Bonus</h4>
                        <p className="text-sm text-green-800">
                          Get your first month of membership FREE when you join today!
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">💳 Secure Payment</h4>
                        <p className="text-sm text-blue-800">
                          Your payment information is encrypted and secure. 
                          You can cancel anytime.
                        </p>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Registration
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        By completing registration, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Reminder */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What You'll Get as a BASA Member
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">150+ Business Connections</h3>
                <p className="text-gray-600 text-sm">
                  Access to San Antonio's premier business network with vetted professionals.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">50% Event Discounts</h3>
                <p className="text-gray-600 text-sm">
                  Save hundreds on networking events, workshops, and industry summits.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exclusive Resources</h3>
                <p className="text-gray-600 text-sm">
                  Access to member-only business resources, templates, and expert consultations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 