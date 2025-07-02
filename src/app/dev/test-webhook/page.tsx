"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    jobTitle: 'CEO',
    company: 'Test Business',
    businessName: 'Test Business',
    phone: '(210) 555-0123',
    isNewUser: true
  })

  const handleTestWebhook = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/dev/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Webhook test completed successfully! Payment Intent ID: ${data.paymentIntentId}`
        })
      } else {
        setResult({
          success: false,
          message: `Webhook test failed: ${data.error || 'Unknown error'}`
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Test Webhook Email System
              </CardTitle>
              <CardDescription>
                This page allows you to manually trigger a webhook event to test the email system.
                Use this to verify that welcome emails and payment receipt emails are working correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID (optional)</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Leave empty for test user"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Test User"
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Test"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="User"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="CEO"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Test Business"
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Test Business"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(210) 555-0123"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNewUser"
                  checked={formData.isNewUser}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isNewUser: checked as boolean })
                  }
                />
                <Label htmlFor="isNewUser">Is New User (will trigger welcome email)</Label>
              </div>

              <Button 
                onClick={handleTestWebhook} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Webhook...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Test Webhook & Send Emails
                  </>
                )}
              </Button>

              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    <span className="font-medium">
                      {result.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{result.message}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What this test does:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Creates a mock payment intent with your test data</li>
                  <li>• Triggers the webhook handler directly</li>
                  <li>• Sends welcome email (if new user) and payment receipt email</li>
                  <li>• Updates user/member records in the database</li>
                  <li>• Logs all actions to the console</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  Check the browser console and server logs for detailed information about the webhook processing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 