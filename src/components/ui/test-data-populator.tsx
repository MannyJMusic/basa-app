'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Database, 
  User, 
  Building2, 
  CreditCard, 
  Copy, 
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Mail
} from 'lucide-react'

interface TestData {
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
    jobTitle: string
    linkedin: string
  }
  business: {
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
  payment: {
    cardNumber: string
    expiryDate: string
    cvv: string
    name: string
  }
}

const TEST_DATA: TestData = {
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@testcompany.com',
    phone: '(210) 555-0123',
    jobTitle: 'CEO',
    linkedin: 'https://linkedin.com/in/johndoe'
  },
  business: {
    businessName: 'Test Company LLC',
    industry: 'technology',
    businessAddress: '123 Main Street',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78205',
    businessPhone: '(210) 555-0124',
    website: 'https://testcompany.com',
    businessDescription: 'A technology company specializing in web development and digital solutions.'
  },
  payment: {
    cardNumber: '4242424242424242',
    expiryDate: '12/25',
    cvv: '123',
    name: 'John Doe'
  }
}

interface TestDataPopulatorProps {
  onPopulateContact?: (data: TestData['contact']) => void
  onPopulateBusiness?: (data: TestData['business']) => void
  onPopulatePayment?: (data: TestData['payment']) => void
  showPaymentData?: boolean
}

export function TestDataPopulator({
  onPopulateContact,
  onPopulateBusiness,
  onPopulatePayment,
  showPaymentData = false
}: TestDataPopulatorProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [customEmail, setCustomEmail] = useState('')

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const getDataWithCustomEmail = (data: TestData['contact']) => {
    if (customEmail.trim()) {
      return { ...data, email: customEmail.trim() }
    }
    return data
  }

  const handlePopulateContact = () => {
    if (onPopulateContact) {
      onPopulateContact(getDataWithCustomEmail(TEST_DATA.contact))
    }
  }

  const handlePopulateBusiness = () => {
    if (onPopulateBusiness) {
      onPopulateBusiness(TEST_DATA.business)
    }
  }

  const handlePopulatePayment = () => {
    if (onPopulatePayment) {
      onPopulatePayment(TEST_DATA.payment)
    }
  }

  const handlePopulateAll = () => {
    handlePopulateContact()
    handlePopulateBusiness()
    if (showPaymentData) {
      handlePopulatePayment()
    }
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Test Data Populator
            <Badge variant="secondary" className="ml-2 text-xs">
              DEV ONLY
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Quick populate forms with test data for development
        </CardDescription>
      </CardHeader>

      {/* Collapsed Quick Actions */}
      {!isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Custom Email Input */}
            <div className="space-y-2">
              <Label htmlFor="custom-email" className="text-xs font-medium text-gray-700">
                <Mail className="w-3 h-3 inline mr-1" />
                Custom Email (optional)
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="custom-email"
                  type="email"
                  placeholder="Enter real email for testing"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCustomEmail('')}
                  className="h-8 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handlePopulateAll}
                className="text-xs h-8"
              >
                <Zap className="w-3 h-3 mr-1" />
                Populate All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePopulateContact}
                className="text-xs h-8"
              >
                <User className="w-3 h-3 mr-1" />
                Contact Only
              </Button>
            </div>

            {/* Email Preview */}
            {customEmail && (
              <div className="text-xs text-gray-600 bg-blue-100 p-2 rounded">
                <strong>Will use:</strong> {customEmail}
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Custom Email Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-email-expanded" className="text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 inline mr-2" />
              Custom Email (optional)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="custom-email-expanded"
                type="email"
                placeholder="Enter real email for testing"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCustomEmail('')}
                className="px-3"
              >
                Clear
              </Button>
            </div>
            {customEmail && (
              <div className="text-xs text-gray-600 bg-blue-100 p-2 rounded">
                <strong>Will use:</strong> {customEmail}
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Contact Information
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePopulateContact}
                className="text-xs"
              >
                Populate
              </Button>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Name: {TEST_DATA.contact.firstName} {TEST_DATA.contact.lastName}</div>
              <div>Email: {customEmail || TEST_DATA.contact.email}</div>
              <div>Phone: {TEST_DATA.contact.phone}</div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Business Information
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePopulateBusiness}
                className="text-xs"
              >
                Populate
              </Button>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Company: {TEST_DATA.business.businessName}</div>
              <div>Address: {TEST_DATA.business.businessAddress}, {TEST_DATA.business.city}, {TEST_DATA.business.state}</div>
              <div>Phone: {TEST_DATA.business.businessPhone}</div>
            </div>
          </div>

          {/* Payment Information (if enabled) */}
          {showPaymentData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Information
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePopulatePayment}
                  className="text-xs"
                >
                  Populate
                </Button>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Card: {TEST_DATA.payment.cardNumber}</div>
                <div>Expiry: {TEST_DATA.payment.expiryDate}</div>
                <div>CVV: {TEST_DATA.payment.cvv}</div>
              </div>
            </div>
          )}

          {/* Stripe Test Cards */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">Stripe Test Cards</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Success: 4242 4242 4242 4242</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy('4242424242424242', 'success')}
                  className="h-6 px-2 text-xs"
                >
                  {copied === 'success' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Decline: 4000 0000 0000 0002</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy('4000000000000002', 'decline')}
                  className="h-6 px-2 text-xs"
                >
                  {copied === 'decline' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Requires Auth: 4000 0025 0000 3155</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy('4000002500003155', 'auth')}
                  className="h-6 px-2 text-xs"
                >
                  {copied === 'auth' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center text-xs text-amber-700 bg-amber-50 p-2 rounded">
            <AlertTriangle className="w-3 h-3 mr-1" />
            This component only appears in development mode
          </div>
        </CardContent>
      )}
    </Card>
  )
} 