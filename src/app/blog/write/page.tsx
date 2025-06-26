"use client";
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PenLine, CheckCircle } from "lucide-react"

export default function WriteForUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    content: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    if (!formData.name || !formData.email || !formData.topic || !formData.content) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }
    try {
      // In a real app, this would send the data to your backend/editorial team
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to submit your post. Please try again.")
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
                  Submission Received!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Thank you for your interest in contributing to the BASA Blog. Our editorial team will review your submission and contact you soon.
                </p>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/blog">Back to Blog</Link>
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
              <Badge className="bg-blue-100 text-blue-800 mb-2">Write for Us</Badge>
              <CardTitle className="text-3xl font-bold mb-2">Share Your Story or Expertise</CardTitle>
              <CardDescription className="mb-4">
                BASA welcomes guest posts from members and San Antonio business leaders. Share your networking tips, success stories, or industry insights with our community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => handleInputChange("name", e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
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
                <div>
                  <Label htmlFor="topic">Proposed Topic *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={e => handleInputChange("topic", e.target.value)}
                    placeholder="e.g. Networking Tips, Member Spotlight, Industry Insight"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Your Article or Story *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={e => handleInputChange("content", e.target.value)}
                    placeholder="Paste your article or story here (or a detailed outline)"
                    rows={8}
                    required
                  />
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
                      <PenLine className="w-4 h-4 mr-2 animate-pulse" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <PenLine className="w-4 h-4 mr-2" />
                      Submit Guest Post
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-8 bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                <h4 className="font-semibold mb-2">Submission Guidelines</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Original content only (not published elsewhere)</li>
                  <li>Topics: Networking, member stories, industry insights, event recaps, business resources</li>
                  <li>Length: 500-1500 words recommended</li>
                  <li>Include actionable tips or takeaways</li>
                  <li>Attach images or video links if available</li>
                  <li>Our editorial team may edit for clarity and length</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 