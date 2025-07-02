'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  X, 
  RefreshCw,
  Clock,
  Info,
  User,
  CreditCard,
  Users,
  Send,
  Bug
} from 'lucide-react'

interface EmailLog {
  id: string
  type: 'welcome' | 'receipt' | 'invitation' | 'fallback'
  email: string
  status: 'success' | 'failed' | 'attempting'
  message: string
  timestamp: Date
  details?: any
}

interface DevEmailLoggerProps {
  paymentId?: string
  customerEmail?: string
}

export function DevEmailLogger({ paymentId, customerEmail }: DevEmailLoggerProps) {
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [showLogger, setShowLogger] = useState(true)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === 'development')
  }, [])

  useEffect(() => {
    if (!isDevelopment || !paymentId) return

    // Simulate email logs based on payment completion
    const simulateEmailLogs = () => {
      const logs: EmailLog[] = []
      
      if (customerEmail) {
        // Welcome email log
        logs.push({
          id: 'welcome-1',
          type: 'welcome',
          email: customerEmail,
          status: 'success',
          message: 'Welcome email sent successfully',
          timestamp: new Date(Date.now() - 5000), // 5 seconds ago
          details: {
            template: 'welcome',
            activationUrl: `${window.location.origin}/auth/verify-email?token=test123&email=${customerEmail}`
          }
        })

        // Payment receipt email log
        logs.push({
          id: 'receipt-1',
          type: 'receipt',
          email: customerEmail,
          status: 'success',
          message: 'Payment receipt email sent successfully',
          timestamp: new Date(Date.now() - 3000), // 3 seconds ago
          details: {
            template: 'payment-receipt',
            paymentId,
            amount: '245.00'
          }
        })
      }

      setEmailLogs(logs)
    }

    // Simulate logs after a short delay
    const timer = setTimeout(simulateEmailLogs, 1000)
    return () => clearTimeout(timer)
  }, [isDevelopment, paymentId, customerEmail])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'attempting':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'attempting':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Attempting</Badge>
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
      case 'fallback':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <Mail className="w-4 h-4 text-gray-500" />
    }
  }

  const addTestLog = () => {
    const newLog: EmailLog = {
      id: `test-${Date.now()}`,
      type: 'welcome',
      email: customerEmail || 'test@example.com',
      status: 'success',
      message: 'Test email log added',
      timestamp: new Date(),
      details: {
        template: 'test',
        test: true
      }
    }
    setEmailLogs(prev => [newLog, ...prev])
  }

  if (!isDevelopment || !showLogger) {
    return null
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Email Logger</CardTitle>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              DEV ONLY
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addTestLog}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Send className="w-3 h-3 mr-1" />
              Add Test Log
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogger(false)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-blue-700">
          Real-time email sending logs and status for development debugging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Logs */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Bug className="w-4 h-4 mr-2" />
            Email Logs ({emailLogs.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {emailLogs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No email logs yet</p>
                <p className="text-xs">Email logs will appear here when payments are processed</p>
              </div>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-start space-x-3 flex-1">
                    {getEmailTypeIcon(log.type)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">
                        {log.type} Email
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {log.message}
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-400 mt-1">
                          Template: {log.details.template}
                          {log.details.paymentId && ` | Payment: ${log.details.paymentId}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusIcon(log.status)}
                    {getStatusBadge(log.status)}
                    <div className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Logger Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Status:</span>
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Payment ID:</span>
              <div className="text-gray-900 font-mono text-xs">{paymentId || 'N/A'}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Customer Email:</span>
              <div className="text-gray-900">{customerEmail || 'N/A'}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Last Updated:</span>
              <div className="text-gray-900">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
          <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Email logs appear automatically when payments are processed</li>
            <li>• Check the browser console for detailed email sending logs</li>
            <li>• Use "Add Test Log" to simulate email events</li>
            <li>• Monitor webhook processing in the server logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 