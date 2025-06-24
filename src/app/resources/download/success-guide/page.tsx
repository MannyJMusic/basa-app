'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Mail, 
  Lock, 
  Star,
  ArrowLeft,
  Users,
  TrendingUp,
  Target,
  Clock,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

export default function SuccessGuideDownloadPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    agreeToTerms: false,
    subscribeToNewsletter: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
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

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms) {
      setError('Please fill in all required fields and agree to the terms.')
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, this would send the data to your backend
      // and trigger the download
      console.log('Form submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Trigger download (in real app, this would be a secure download link)
      const link = document.createElement('a')
      link.href = '/api/resources/download/success-guide'
      link.download = 'BASA-Networking-Success-Guide.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setIsDownloaded(true)
    } catch (err) {
      setError('Failed to process your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDownloaded) {
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
                  Download Complete!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Your San Antonio Business Networking Success Guide is ready. 
                  Check your email for additional resources and tips.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Read through the 15-page guide</li>
                      <li>• Implement the networking strategies</li>
                      <li>• Attend a BASA event to practice</li>
                      <li>• Consider joining as a member</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/events">Browse Upcoming Events</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/membership/join">Join BASA Today</Link>
                  </Button>
                </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/resources" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Download Your Free Success Guide
            </h1>
            <p className="text-xl text-gray-600">
              Get instant access to our comprehensive networking guide
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Download Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Get Your Free Guide
                </CardTitle>
                <CardDescription>
                  Enter your details to download the San Antonio Business Networking Success Guide
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
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="subscribeToNewsletter"
                        checked={formData.subscribeToNewsletter}
                        onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked as boolean)}
                      />
                      <Label htmlFor="subscribeToNewsletter" className="text-sm">
                        Subscribe to our weekly market insights newsletter
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        required
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm">
                        I agree to receive the free guide and occasional business updates from BASA. 
                        I can unsubscribe at any time.
                      </Label>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
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
                        <Download className="w-4 h-4 mr-2 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Free Guide
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Guide Preview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  What's Inside the Guide
                </CardTitle>
                <CardDescription>
                  Your 15-page comprehensive networking success guide
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guide Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pages:</span>
                    <Badge variant="secondary">15 pages</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Format:</span>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">File Size:</span>
                    <Badge variant="secondary">2.4 MB</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Table of Contents</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Chapter 1: The Power of Local Networking</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Chapter 2: Building Authentic Relationships</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Target className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Chapter 3: Strategic Networking for Business Growth</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Chapter 4: Leveraging BASA's Network</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Chapter 5: Success Stories from BASA Members</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Why This Guide Works</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Based on real BASA member experiences</li>
                    <li>• Proven strategies for San Antonio market</li>
                    <li>• Actionable tips you can implement today</li>
                    <li>• Exclusive insights from successful entrepreneurs</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">100% Free & Secure</p>
                      <p>No credit card required. Your information is protected and you can unsubscribe anytime.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 