'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Mail, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  ArrowRight,
  Download,
  Share2,
  Star,
  AlertCircle,
  UserPlus,
  Send,
  Sparkles,
  Trophy,
  Gift,
  Shield,
  Zap,
  Heart,
  PartyPopper,
  FileText,
  Printer,
  ExternalLink,
  Check,
  Bell,
  Key,
  Globe,
  Target,
  Award,
  User,
  Building2,
  Phone,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { DevControlPanel } from '@/components/dev/DevControlPanel'

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

interface CheckoutData {
  cart: CartItem[]
  additionalMembers: AdditionalMember[]
  total: number
  customerInfo?: {
    name: string
    email: string
    company: string
    phone: string
  }
  businessInfo?: {
    businessName: string
    businessAddress: string
    city: string
    state: string
    zipCode: string
    businessPhone: string
  }
  contactInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    jobTitle: string
  }
}

const MEMBERSHIP_TIERS = {
  // Chapter Memberships
  'meeting-member': {
    name: 'Meeting Member',
    price: 149,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    features: [
      'Special Rates at BASA Networking Events for 1 Employee',
      'Directory Listing on the BASA Website',
      'Receive a New Member Bundle Bag',
      'Opportunity to provide Marketing Materials for the Bundle Bag',
      'Access to the BASA Private Facebook Page',
      'Receive BASA Benefits from fellow members',
      'Opportunity to provide a BASA Benefit to your fellow members',
      'Membership Certificate'
    ]
  },
  'associate-member': {
    name: 'Associate Member',
    price: 245,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    features: [
      'Special Rates at BASA Networking Events for 2 Employees',
      'Directory Listing on the BASA Website',
      'Receive a New Member Bundle Bag',
      'Opportunity to provide Marketing Materials for the Bundle Bag',
      'Access to the BASA Private Facebook Page',
      '2 shared E-Blasts per month (content provided by member)',
      '1 social media post per month (content provided by member)',
      '1 video post on social media per month (content provided by member)',
      'Receive BASA Benefits from fellow members',
      'Opportunity to provide a BASA Benefit to your fellow members',
      'Membership Certificate'
    ]
  },
  'trio-member': {
    name: 'TRIO Member',
    price: 295,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    features: [
      'Membership in ALL THREE CHAPTERS',
      'Special Rates at BASA Networking Events for 1 Employee',
      'Directory Listing on the BASA Website',
      'Receive a New Member Bundle Bag',
      'Access to the BASA Private Facebook Page',
      'Opportunity to provide Marketing Materials for the Bundle Bag',
      'Receive BASA Benefits from fellow members',
      'Opportunity to provide a BASA Benefit to your fellow members',
      'Membership Certificate'
    ]
  },
  // Resource Memberships
  'class-resource-member': {
    name: 'Class Resource Member',
    price: 120,
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    features: [
      'Special rates for one at monthly training class',
      'Directory listing on the BASA Resource Page',
      'Access to BASA Resource Website & Private Facebook Page',
      'Bundle Bag - provide marketing materials',
      'Receive a BASA Bundle Bag',
      'Receive BASA Benefits from fellow BASA Members',
      'Provide a BASA Benefit to fellow BASA Members',
      'Welcome post on social media outlets'
    ]
  },
  'nag-resource-member': {
    name: 'NAG Resource Member',
    price: 0,
    color: 'bg-gray-500',
    gradient: 'from-gray-500 to-gray-600',
    features: [
      'As a Networking & Giving NAG Member, the benefits of a Resource Member are included.'
    ]
  },
  'training-resource-member': {
    name: 'Training Resource Member',
    price: 225,
    color: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    features: [
      'Guaranteed seat for one at monthly training class',
      'Special rate for additional attendees to training classes',
      'Opportunity to be a trainer/panelist within the year',
      'Directory listing on the BASA Resource Page',
      'Access to BASA Resource Website & Private Facebook Page',
      'Bundle Bag - provide marketing materials',
      'Receive a BASA Bundle Bag',
      'Receive BASA Benefits from fellow BASA Members',
      'Provide a BASA Benefit to fellow BASA Members',
      'Welcome post on social media outlets'
    ]
  }
}

const EVENT_DATA = {
  'monthly-mixer-2024': {
    title: 'BASA Monthly Mixer',
    date: '2024-02-15',
    time: '18:00',
    location: 'San Antonio Chamber of Commerce',
    address: '602 E Commerce St, San Antonio, TX 78205'
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const type = searchParams.get('type')
  const paymentId = searchParams.get('paymentId')
  const eventId = searchParams.get('eventId')
  const cartParam = searchParams.get('cart')

  useEffect(() => {
    setIsClient(true)
    const now = new Date()
    setCurrentDate(now.toLocaleDateString())
    setCurrentTime(now.toLocaleTimeString())
  }, [])

  useEffect(() => {
    if (cartParam) {
      try {
        const parsed = JSON.parse(cartParam) as CheckoutData
        setCheckoutData(parsed)
      } catch (err) {
        console.error('Failed to parse cart data:', err)
      }
    } else if (paymentId) {
      // Robust: fetch from backend if not present in query
      fetch(`/api/payments/receipt?paymentId=${paymentId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setCheckoutData(data)
        })
        .catch(err => {
          console.error('Failed to fetch checkout data:', err)
        })
    }
  }, [cartParam, paymentId])

  // Note: Emails are now handled by the webhook system
  // This prevents duplicate emails from being sent

  const isMembership = type === 'membership'
  const isEvent = type === 'event'
  const totalMemberships = checkoutData?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0
  const hasMultipleMemberships = totalMemberships > 1

  // Calculate subtotal from cart items
  const subtotal = checkoutData?.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0

  const handlePrintReceipt = () => {
    setIsPrinting(true)
    setTimeout(() => {
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
      if (printWindow) {
        printWindow.document.write(generateInvoiceHTML())
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        setIsPrinting(false)
      }
    }, 100)
  }

  const handleDownloadReceipt = () => {
    setIsDownloading(true)
    setTimeout(() => {
      const blob = new Blob([generateInvoiceHTML()], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `basa-invoice-${paymentId}.html`
      link.click()
      URL.revokeObjectURL(url)
      setIsDownloading(false)
    }, 1000)
  }

  const generateInvoiceHTML = () => {
    const logoUrl = `${window.location.origin}/images/logos/BASA - LOGO -CMYK - PROOF.png`
    const customerName = checkoutData?.customerInfo?.name || 
                       (checkoutData?.contactInfo ? 
                        `${checkoutData.contactInfo.firstName} ${checkoutData.contactInfo.lastName}` : 
                        'Customer')
    const customerEmail = checkoutData?.customerInfo?.email || checkoutData?.contactInfo?.email || 'N/A'
    const customerPhone = checkoutData?.customerInfo?.phone || checkoutData?.contactInfo?.phone || 'N/A'
    const businessName = checkoutData?.businessInfo?.businessName || checkoutData?.customerInfo?.company || 'N/A'
    const businessAddress = checkoutData?.businessInfo?.businessAddress || 'N/A'
    const businessCity = checkoutData?.businessInfo?.city || 'N/A'
    const businessState = checkoutData?.businessInfo?.state || 'N/A'
    const businessZip = checkoutData?.businessInfo?.zipCode || 'N/A'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BASA Invoice - ${paymentId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .invoice-logo { display: block; margin: 0 auto 16px auto; max-width: 220px; height: auto; }
          .invoice-title { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .invoice-subtitle { font-size: 16px; color: #666; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .customer-info, .invoice-info { flex: 1; }
          .customer-info h3, .invoice-info h3 { margin-top: 0; color: #2563eb; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background-color: #f8fafc; font-weight: bold; }
          .total-section { text-align: right; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; margin: 5px 0; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          .status-badge { background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <img src="${logoUrl}" alt="BASA Logo" class="invoice-logo" />
          <div class="invoice-title">BASA - Business Association of San Antonio</div>
          <div class="invoice-subtitle">Official Invoice</div>
        </div>
        
        <div class="invoice-details">
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${customerName}</strong></p>
            <p>${businessName}</p>
            <p>${businessAddress}</p>
            <p>${businessCity}, ${businessState} ${businessZip}</p>
            <p>Email: ${customerEmail}</p>
            <p>Phone: ${customerPhone}</p>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${paymentId}</p>
            <p><strong>Date:</strong> ${currentDate}</p>
            <p><strong>Time:</strong> ${currentTime}</p>
            <p><strong>Status:</strong> <span class="status-badge">PAID</span></p>
            <p><strong>Payment Method:</strong> Credit Card</p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${checkoutData?.cart.map(item => {
              const tier = MEMBERSHIP_TIERS[item.tierId as keyof typeof MEMBERSHIP_TIERS]
              return `
                <tr>
                  <td><strong>${tier.name}</strong></td>
                  <td>Annual BASA Membership</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
            }).join('') || ''}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">Subtotal: $${subtotal.toFixed(2)}</div>
          <div class="total-row">Tax: $0.00</div>
          <div class="total-row" style="font-size: 24px; color: #2563eb;">Total: $${subtotal.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for joining BASA! Your membership is now active.</p>
          <p>Business Association of San Antonio | www.businessassociationsa.com</p>
          <p>For questions, contact: <a href="mailto:info@businessassociationsa.com">info@businessassociationsa.com</a></p>
          <p>Visit us: <a href="https://www.businessassociationsa.com" target="_blank">www.businessassociationsa.com</a></p>
        </div>
      </body>
      </html>
    `
  }

  if (!type || !paymentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">Unable to verify your payment information. Please contact support if you believe this is an error.</p>
          <Button asChild>
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DevControlPanel
      paymentData={checkoutData}
      emailStatus={{ active: true, paymentId, customerEmail: checkoutData?.customerInfo?.email || checkoutData?.contactInfo?.email }}
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Banner Header */}
        <div className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white flex items-center px-4 py-4 md:py-3 shadow-md">
          <img src="/images/BASA-LOGO.png" alt="BASA Logo" className="h-12 w-auto mr-4" />
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-white mr-2" />
            <span className="text-2xl md:text-3xl font-bold">Payment Successful!</span>
          </div>
          <div className="ml-auto flex flex-col items-end text-xs opacity-80">
            <span>Payment ID: {paymentId}</span>
            <span>{isClient ? currentDate : 'Loading...'}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Summary/Receipt Card */}
            <div className="md:col-span-2">
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-green-500" />
                      Receipt & Membership Summary
                    </CardTitle>
                    <CardDescription>
                      Thank you for joining BASA! Below are your membership and payment details.
                    </CardDescription>
                  </div>
                  {/* Activation Instructions */}
                  <div className="mt-4 md:mt-0 md:ml-8">
                    <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                      <Mail className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-amber-800 text-sm">Check your email to activate your account.</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Contact & Business Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                        <User className="w-4 h-4 mr-2" />Primary Contact
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600">Name:</span> <span className="font-medium">{checkoutData?.customerInfo?.name || (checkoutData?.contactInfo ? `${checkoutData.contactInfo.firstName} ${checkoutData.contactInfo.lastName}` : 'N/A')}</span></div>
                        <div><span className="text-gray-600">Email:</span> <span className="font-medium">{checkoutData?.customerInfo?.email || checkoutData?.contactInfo?.email || 'N/A'}</span></div>
                        <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{checkoutData?.customerInfo?.phone || checkoutData?.contactInfo?.phone || 'N/A'}</span></div>
                        {checkoutData?.contactInfo?.jobTitle && <div><span className="text-gray-600">Job Title:</span> <span className="font-medium">{checkoutData.contactInfo.jobTitle}</span></div>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                        <Building2 className="w-4 h-4 mr-2" />Business Info
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600">Company:</span> <span className="font-medium">{checkoutData?.businessInfo?.businessName || checkoutData?.customerInfo?.company || 'N/A'}</span></div>
                        {checkoutData?.businessInfo?.businessAddress && <div><span className="text-gray-600">Address:</span> <span className="font-medium">{checkoutData.businessInfo.businessAddress}</span></div>}
                        {checkoutData?.businessInfo?.city && <div><span className="text-gray-600">City:</span> <span className="font-medium">{checkoutData.businessInfo.city}</span></div>}
                        {checkoutData?.businessInfo?.state && <div><span className="text-gray-600">State:</span> <span className="font-medium">{checkoutData.businessInfo.state}</span></div>}
                        {checkoutData?.businessInfo?.zipCode && <div><span className="text-gray-600">ZIP:</span> <span className="font-medium">{checkoutData.businessInfo.zipCode}</span></div>}
                        {checkoutData?.businessInfo?.businessPhone && <div><span className="text-gray-600">Business Phone:</span> <span className="font-medium">{checkoutData.businessInfo.businessPhone}</span></div>}
                      </div>
                    </div>
                  </div>
                  {/* Itemized Purchase Breakdown */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2" />Purchase Details
                    </h4>
                    <div className="space-y-4">
                      {checkoutData?.cart.map((item) => {
                        const tier = MEMBERSHIP_TIERS[item.tierId as keyof typeof MEMBERSHIP_TIERS]
                        return (
                          <div key={item.tierId} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{tier.name}</div>
                              <div className="text-xs text-gray-600">Annual Membership</div>
                              <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-right mt-2 md:mt-0">
                              <div className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                              <div className="text-xs text-gray-500">Unit: ${item.price.toFixed(2)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex justify-between w-full md:w-1/3">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">${checkoutData?.total.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between w-full md:w-1/3">
                        <span className="text-gray-600">Tax:</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between w-full md:w-1/3 text-lg font-bold text-blue-600">
                        <span>Total:</span>
                        <span>${checkoutData?.total.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Membership Details (collapsible) */}
                  {isMembership && checkoutData && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-500" />Your BASA Membership
                      </h4>
                      <div className="space-y-2">
                        {checkoutData.cart.map((item) => {
                          const tier = MEMBERSHIP_TIERS[item.tierId as keyof typeof MEMBERSHIP_TIERS]
                          return (
                            <div key={item.tierId} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-blue-900">{tier.name}</span>
                                <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                              </div>
                              <ul className="text-xs text-gray-700 list-disc ml-5">
                                {tier.features.slice(0, 3).map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                      {checkoutData.additionalMembers.length > 0 && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <UserPlus className="w-4 h-4 mr-2" />Additional Members ({checkoutData.additionalMembers.length})
                          </h5>
                          <div className="space-y-2">
                            {checkoutData.additionalMembers.map((member) => (
                              <div key={member.id} className="bg-white p-2 rounded border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between">
                                <span className="font-medium text-gray-900">{member.name}</span>
                                <span className="text-xs text-gray-600">{member.email}</span>
                                {member.sendInvitation && <span className="text-xs text-green-700 ml-2">Invitation Sent</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Print/Download Buttons */}
                  <div className="flex flex-col md:flex-row md:justify-end gap-3 mt-4">
                    <Button onClick={handlePrintReceipt} disabled={isPrinting} variant="outline">
                      {isPrinting ? (<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Printing...</>) : (<><Printer className="w-4 h-4 mr-2" />Print Receipt</>)}
                    </Button>
                    <Button onClick={handleDownloadReceipt} disabled={isDownloading}>
                      {isDownloading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Downloading...</>) : (<><Download className="w-4 h-4 mr-2" />Download Receipt</>)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Sidebar: Quick Actions & Security Notice */}
            <div className="space-y-6">
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="w-5 h-5 mr-2" />Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/dashboard">
                      <ArrowRight className="w-4 h-4 mr-2" />Go to Dashboard
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/events">
                        <Calendar className="w-4 h-4 mr-2" />Events
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/membership">
                        <Users className="w-4 h-4 mr-2" />Membership
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-xl border-0 bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Secure & Protected</h4>
                      <p className="text-sm text-blue-800">Your payment information is encrypted and secure. We use industry-standard SSL encryption.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DevControlPanel>
  )
} 