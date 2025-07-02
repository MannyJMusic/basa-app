'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bug, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Copy,
  ExternalLink,
  Clock,
  User,
  Building2,
  CreditCard,
  Users,
  Send
} from 'lucide-react'

interface EmailNotification {
  id: string
  type: 'welcome' | 'receipt' | 'invitation'
  email: string
  name: string
  status: 'sent' | 'failed' | 'pending'
  timestamp: Date
  details?: any
}

interface DevNotificationProps {
  paymentId?: string
  customerEmail?: string
  customerName?: string
  membershipType?: string
  totalAmount?: number
  additionalMembers?: Array<{
    email: string
    name: string
    sendInvitation: boolean
  }>
}

export function DevNotifications({ 
  paymentId, 
  customerEmail, 
  customerName, 
  membershipType, 
  totalAmount,
  additionalMembers = []
}: DevNotificationProps) {
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<any>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    // Check if we're in development environment
    setIsDevelopment(process.env.NODE_ENV === 'development')
    
    if (process.env.NODE_ENV === 'development' && customerEmail) {
      // Simulate email notifications that would be sent
      const notifications: EmailNotification[] = []
      
      // Welcome email (if new user)
      notifications.push({
        id: 'welcome-1',
        type: 'welcome',
        email: customerEmail,
        name: customerName || 'Customer',
        status: 'sent',
        timestamp: new Date(),
        details: {
          template: 'welcome',
          activationUrl: `${window.location.origin}/auth/verify-email?token=test123&email=${customerEmail}`
        }
      })
      
      // Payment receipt email
      notifications.push({
        id: 'receipt-1',
        type: 'receipt',
        email: customerEmail,
        name: customerName || 'Customer',
        status: 'sent',
        timestamp: new Date(),
        details: {
          template: 'payment-receipt',
          paymentId,
          amount: totalAmount,
          membershipType
        }
      })
      
      // Additional member invitations
      additionalMembers.forEach((member, index) => {
        if (member.sendInvitation) {
          notifications.push({
            id: `invitation-${index + 1}`,
            type: 'invitation',
            email: member.email,
            name: member.name,
            status: 'sent',
            timestamp: new Date(),
            details: {
              template: 'membership-invitation',
              invitedBy: customerName,
              membershipType
            }
          })
        }
      })
      
      setEmailNotifications(notifications)
    }
  }, [customerEmail, customerName, paymentId, membershipType, totalAmount, additionalMembers])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const checkEmailStatus = async () => {
    if (!paymentId || !customerEmail) return
    
    setCheckingStatus(true)
    try {
      const response = await fetch(`/api/dev/email-status?paymentId=${paymentId}&email=${customerEmail}`)
      const data = await response.json()
      
      if (data.success) {
        setEmailStatus(data.data)
        console.log('📧 Email status checked:', data.data)
      } else {
        console.error('Failed to check email status:', data.error)
      }
    } catch (error) {
      console.error('Error checking email status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const sendTestEmail = async (emailType: string) => {
    if (!paymentId || !customerEmail) return
    
    try {
      const response = await fetch('/api/dev/email-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          email: customerEmail,
          emailType
        })
      })
      
      const data = await response.json()
      if (data.success) {
        console.log('📧 Test email sent:', data.data)
        // Refresh email status
        setTimeout(checkEmailStatus, 1000)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getEmailTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <User className="w-4 h-4 text-blue-500" />
      case 'receipt':
        return <CreditCard className="w-4 h-4 text-green-500" />
      case 'invitation':
        return <Users className="w-4 h-4 text-purple-500" />
      default:
        return <Mail className="w-4 h-4 text-gray-500" />
    }
  }

  if (!isDevelopment || !showNotifications) {
    return null
  }

  return (
    <Card className="border-2 border-orange-200 bg-orange-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-900">Developer Notifications</CardTitle>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              DEV ONLY
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(false)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-orange-700">
          Email sending confirmation and debugging information for development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Information */}
        <div className="bg-white rounded-lg p-3 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-orange-700 font-medium">Payment ID:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-orange-100 px-2 py-1 rounded text-xs font-mono">
                  {paymentId || 'N/A'}
                </code>
                {paymentId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(paymentId, 'paymentId')}
                    className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
                  >
                    {copiedId === 'paymentId' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <span className="text-orange-700 font-medium">Customer:</span>
              <div className="text-gray-900">{customerName || 'N/A'}</div>
            </div>
            <div>
              <span className="text-orange-700 font-medium">Email:</span>
              <div className="text-gray-900">{customerEmail || 'N/A'}</div>
            </div>
            <div>
              <span className="text-orange-700 font-medium">Amount:</span>
              <div className="text-gray-900">${totalAmount?.toFixed(2) || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-lg p-3 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email Notifications ({emailNotifications.length})
          </h4>
          <div className="space-y-3">
            {emailNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex items-center space-x-3">
                  {getEmailTypeIcon(notification.type)}
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {notification.type} Email
                    </div>
                    <div className="text-sm text-gray-600">
                      {notification.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(notification.status)}
                  {getStatusBadge(notification.status)}
                  <div className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Status Results */}
        {emailStatus && (
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email Status Results
            </h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-orange-700 font-medium">Checked At:</span>
                  <div className="text-gray-900">{new Date(emailStatus.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-orange-700 font-medium">Environment:</span>
                  <div className="text-gray-900">{emailStatus.environment}</div>
                </div>
                <div>
                  <span className="text-orange-700 font-medium">Mailgun Domain:</span>
                  <div className="text-gray-900">{emailStatus.mailgunDomain || 'Not configured'}</div>
                </div>
                <div>
                  <span className="text-orange-700 font-medium">Mailgun API Key:</span>
                  <div className="text-gray-900">{emailStatus.mailgunApiKey}</div>
                </div>
              </div>
              
              <div className="mt-3">
                <h5 className="font-medium text-orange-900 mb-2">Email History:</h5>
                <div className="space-y-2">
                  {emailStatus.emails?.map((email: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{email.type} Email</div>
                        <div className="text-xs text-gray-600">
                          Template: {email.template} | ID: {email.messageId}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(email.status)}
                        {getStatusBadge(email.status)}
                        <div className="text-xs text-gray-500">
                          {new Date(email.sentAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Members */}
        {additionalMembers.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Additional Members ({additionalMembers.length})
            </h4>
            <div className="space-y-2">
              {additionalMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.sendInvitation ? (
                      <>
                        <Send className="w-4 h-4 text-green-500" />
                        <Badge variant="default" className="bg-green-100 text-green-800">Invitation Sent</Badge>
                      </>
                    ) : (
                      <Badge variant="outline">No Invitation</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Actions */}
        <div className="bg-white rounded-lg p-3 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
            <Bug className="w-4 h-4 mr-2" />
            Debug Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/dev/email-preview', '_blank')}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Email Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/dev/test-webhook', '_blank')}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Test Webhooks
            </Button>
            {paymentId && customerEmail && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={checkEmailStatus}
                  disabled={checkingStatus}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  {checkingStatus ? (
                    <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Mail className="w-3 h-3 mr-1" />
                  )}
                  Check Email Status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendTestEmail('welcome')}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send Welcome
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendTestEmail('receipt')}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send Receipt
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg p-3 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Environment Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-orange-700 font-medium">Environment:</span>
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                Development
              </Badge>
            </div>
            <div>
              <span className="text-orange-700 font-medium">Site URL:</span>
              <div className="text-gray-900">{window.location.origin}</div>
            </div>
            <div>
              <span className="text-orange-700 font-medium">Timestamp:</span>
              <div className="text-gray-900">{new Date().toLocaleString()}</div>
            </div>
            <div>
              <span className="text-orange-700 font-medium">User Agent:</span>
              <div className="text-gray-900 text-xs truncate">
                {navigator.userAgent.substring(0, 50)}...
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 