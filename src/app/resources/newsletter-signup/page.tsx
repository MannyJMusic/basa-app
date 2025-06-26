"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, TrendingUp, CheckCircle, Lock, Star } from "lucide-react"
import Link from "next/link"

export default function NewsletterSignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    agreeToTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms) {
      setError("Please fill in all required fields and agree to the terms.")
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, this would send the data to your backend/newsletter provider
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to process your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Subscription Confirmed!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Thank you for subscribing to Monthly Market Insights. Check your inbox for the latest business intelligence and networking tips.
                </p>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/resources">
                    Back to Resources
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Badge className="bg-orange-100 text-orange-800 mb-2">Monthly Market Insights</Badge>
              <CardTitle className="text-3xl font-bold mb-2">Subscribe to Our Newsletter</CardTitle>
              <CardDescription className="mb-4">
                Get weekly business intelligence, networking tips, and exclusive member spotlights delivered to your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={e => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={e => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={e => handleInputChange("agreeToTerms", e.target.checked)}
                    required
                    className="rounded border-gray-300 mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to receive the newsletter and occasional business updates from BASA. I can unsubscribe at any time.
                  </Label>
                </div>
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Mail className="w-4 h-4 mr-2 animate-pulse" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Subscribe Free
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-8 bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>Weekly market analysis and business trends</span>
                </div>
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 mr-2" />
                  <span>Exclusive member spotlights and success stories</span>
                </div>
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Actionable networking tips and event invites</span>
                </div>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  <span>Your information is secure and you can unsubscribe anytime.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 