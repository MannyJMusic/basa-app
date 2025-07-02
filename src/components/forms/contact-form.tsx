"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  MessageSquare
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  subject: string
  message: string
  preferredContact: string
  membershipInterest: boolean
}

export default function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    preferredContact: "email",
    membershipInterest: false
  })

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
        variant: "default",
      })

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
        preferredContact: "email",
        membershipInterest: false
      })
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: "Error Sending Message",
        description: error instanceof Error ? error.message : "Please try again or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "info@businessassociationsa.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "(210) 549-7190",
      description: "Mon-Fri, 9AM-5PM CST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "9002 Wurbach Rd, San Antonio, TX 78240",
      description: "Schedule a meeting"
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contact Information */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="text-gradient-navy flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Get in Touch
            </CardTitle>
            <CardDescription className="text-lg">
              Ready to connect? We're here to help you grow your business network in San Antonio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              const iconColors = [
                "text-blue-600", // Email - blue
                "text-green-600", // Phone - green  
                "text-orange-600" // MapPin - orange
              ]
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${iconColors[index]}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-basa-navy mb-1">{info.title}</h4>
                    <p className="text-basa-charcoal font-medium">
                      {info.title === "Email Us" ? (
                        <a 
                          href={`mailto:${info.details}`}
                          className="text-blue-600 hover:text-navy-600 hover:underline transition-colors"
                        >
                          {info.details}
                        </a>
                      ) : info.title === "Call Us" ? (
                        <a 
                          href={`tel:${info.details.replace(/[^\d+]/g, '')}`}
                          className="text-blue-600 hover:text-navy-600 hover:underline transition-colors"
                        >
                          {info.details}
                        </a>
                      ) : (
                        info.details
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Office Hours */}
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="text-gradient-navy flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Office Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-basa-charcoal">Monday - Friday</span>
                <span className="font-semibold text-basa-navy">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-basa-charcoal">Saturday</span>
                <span className="font-semibold text-basa-navy">By Appointment</span>
              </div>
              <div className="flex justify-between">
                <span className="text-basa-charcoal">Sunday</span>
                <span className="font-semibold text-basa-navy">Closed</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-lg">
              <p className="text-sm text-basa-charcoal">
                <strong>Emergency Contact:</strong> For urgent matters outside business hours, 
                please email us and we'll respond as soon as possible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-2">
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gradient-navy text-2xl">Send us a Message</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Tell us how we can help you grow your business network
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-navy-100 text-navy-800">
                <MessageSquare className="w-4 h-4 mr-1" />
                Contact Form
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-basa-navy font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-basa-navy font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-basa-navy font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                    placeholder="your.email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-basa-navy font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                    placeholder="(210) 555-0123"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-basa-navy font-medium">
                  Company Name
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                  placeholder="Your company name"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-basa-navy font-medium">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                  placeholder="What can we help you with?"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-basa-navy font-medium">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 resize-none"
                  placeholder="Tell us more about your inquiry, networking goals, or how we can help your business grow..."
                />
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-basa-navy font-medium">Preferred Contact Method</Label>
                  <div className="space-y-2">
                    {["email", "phone"].map((method) => (
                      <label key={method} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="preferredContact"
                          value={method}
                          checked={formData.preferredContact === method}
                          onChange={(e) => handleInputChange("preferredContact", e.target.value)}
                          className="text-navy-600 focus:ring-navy-500"
                        />
                        <span className="text-basa-charcoal capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-basa-navy font-medium">Additional Interest</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.membershipInterest}
                        onChange={(e) => handleInputChange("membershipInterest", e.target.checked)}
                        className="text-navy-600 focus:ring-navy-500 rounded"
                      />
                      <span className="text-basa-charcoal">Interested in BASA membership</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-lg py-4 bg-basa-navy text-white font-semibold rounded-full shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>

              {/* Privacy Notice */}
              <div className="text-sm text-gray-600 text-center">
                By submitting this form, you agree to our{" "}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  Privacy Policy
                </a>{" "}
                and consent to being contacted regarding your inquiry.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 