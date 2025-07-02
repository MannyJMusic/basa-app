'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export default function EmailPreviewPage() {
  const { toast } = useToast()
  const [template, setTemplate] = useState('welcome')
  const [firstName, setFirstName] = useState('John')
  const [email, setEmail] = useState('test@example.com')
  const [fromName, setFromName] = useState('BASA')
  const [activationUrl, setActivationUrl] = useState('https://dev.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com')
  const [resetUrl, setResetUrl] = useState('https://dev.businessassociationsa.com/auth/reset-password?token=reset123&email=test@example.com')
  const [isSending, setIsSending] = useState(false)
  
  // Event invitation fields
  const [eventName, setEventName] = useState('BASA Networking Mixer')
  const [eventDate, setEventDate] = useState('2024-01-15')
  const [eventTime, setEventTime] = useState('6:00 PM')
  const [eventLocation, setEventLocation] = useState('San Antonio Business Hub')
  const [eventAddress, setEventAddress] = useState('123 Business St, San Antonio, TX')
  const [eventCapacity, setEventCapacity] = useState('100')
  const [eventPrice, setEventPrice] = useState('25')
  const [eventDescription, setEventDescription] = useState('Join us for an evening of networking and professional development with fellow BASA members.')
  const [rsvpUrl, setRsvpUrl] = useState('https://dev.businessassociationsa.com/events/mixer/rsvp')

  const [lastSendStatus, setLastSendStatus] = useState<'success' | 'error' | null>(null)
  const [lastSendMessage, setLastSendMessage] = useState<string>('')
  const [lastSentDetails, setLastSentDetails] = useState<{template: string, email: string, firstName: string} | null>(null)

  const buildPreviewUrl = () => {
    const params = new URLSearchParams({
      template,
      firstName,
      email
    })

    if (template === 'welcome') {
      params.append('activationUrl', activationUrl)
    } else if (template === 'password-reset') {
      params.append('resetUrl', resetUrl)
    } else if (template === 'event-invitation') {
      params.append('eventName', eventName)
      params.append('eventDate', eventDate)
      params.append('eventTime', eventTime)
      params.append('eventLocation', eventLocation)
      params.append('eventAddress', eventAddress)
      params.append('eventCapacity', eventCapacity)
      params.append('eventPrice', eventPrice)
      params.append('eventDescription', eventDescription)
      params.append('rsvpUrl', rsvpUrl)
      params.append('calendarUrl', rsvpUrl.replace('/rsvp', '/calendar'))
      params.append('shareUrl', rsvpUrl.replace('/rsvp', ''))
    }

    return `/api/dev/email-preview?${params.toString()}`
  }

  const handleSendTestEmail = async () => {
    if (!email || !firstName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    setLastSendStatus(null)
    setLastSendMessage('')
    try {
      const emailData: any = {
        template,
        email,
        firstName,
        fromName
      }

      if (template === 'welcome') {
        emailData.activationUrl = activationUrl
      } else if (template === 'password-reset') {
        emailData.resetUrl = resetUrl
      } else if (template === 'event-invitation') {
        emailData.event = {
          title: eventName,
          date: new Date(eventDate),
          time: eventTime,
          location: eventLocation,
          address: eventAddress,
          capacity: parseInt(eventCapacity),
          price: parseInt(eventPrice),
          description: eventDescription,
          rsvpUrl,
          calendarUrl: rsvpUrl.replace('/rsvp', '/calendar'),
          shareUrl: rsvpUrl.replace('/rsvp', '')
        }
      }

      const response = await fetch('/api/dev/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: `Test ${template} email sent successfully! Check your inbox: ${email}`,
        })
      } else {
        toast({
          title: "Failed to send test email",
          description: data.error || 'Unknown error occurred',
          variant: "destructive"
        })
        setLastSendStatus('error')
        setLastSendMessage(data.error || 'Unknown error occurred')
      }
    } catch (error) {
      toast({
        title: "Failed to send test email",
        description: error instanceof Error ? error.message : 'Network error occurred',
        variant: "destructive"
      })
      setLastSendStatus('error')
      setLastSendMessage(error instanceof Error ? error.message : 'Network error occurred')
    } finally {
      setIsSending(false)
    }
  }

  const previewUrl = buildPreviewUrl()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">BASA Email Preview</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="welcome">Welcome Email</option>
                  <option value="password-reset">Password Reset</option>
                  <option value="event-invitation">Event Invitation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Template-specific controls */}
              {template === 'welcome' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activation URL
                  </label>
                  <input
                    type="url"
                    value={activationUrl}
                    onChange={(e) => setActivationUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {template === 'password-reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reset URL
                  </label>
                  <input
                    type="url"
                    value={resetUrl}
                    onChange={(e) => setResetUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {template === 'event-invitation' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Time
                    </label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={eventAddress}
                      onChange={(e) => setEventAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={eventCapacity}
                        onChange={(e) => setEventCapacity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={eventPrice}
                        onChange={(e) => setEventPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RSVP URL
                    </label>
                    <input
                      type="url"
                      value={rsvpUrl}
                      onChange={(e) => setRsvpUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Open Preview in New Tab
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSending}
                  className={`w-full px-4 py-2 rounded-md transition-colors ${
                    isSending 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSending ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
              {/* Persistent feedback message */}
              {lastSendStatus && (
                <div className={`mt-2 p-3 rounded-md text-sm ${lastSendStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {lastSendMessage}
                </div>
              )}
              {/* Last sent email details */}
              {lastSentDetails && lastSendStatus === 'success' && (
                <div className="mt-2 p-3 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs">
                  <div><strong>Last Sent Email:</strong></div>
                  <div>Template: <span className="font-mono">{lastSentDetails.template}</span></div>
                  <div>To: <span className="font-mono">{lastSentDetails.email}</span></div>
                  <div>First Name: <span className="font-mono">{lastSentDetails.firstName}</span></div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-700">Email Preview</h3>
                </div>
                <div className="h-96 overflow-auto">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Test Emails</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">1. Preview in Browser</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the controls to customize the email</li>
                <li>• Click "Open Preview in New Tab" for full-screen view</li>
                <li>• Test responsive design by resizing browser window</li>
                <li>• Check how it looks in different email clients</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">2. Send Test Emails</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use a real email address to receive test emails</li>
                <li>• Check spam folder if email doesn't arrive</li>
                <li>• Test activation links work correctly</li>
                <li>• Verify Mailgun configuration is working</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">3. Email Client Testing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gmail (web and mobile)</li>
                <li>• Outlook (web and desktop)</li>
                <li>• Apple Mail</li>
                <li>• Thunderbird</li>
                <li>• Mobile email apps</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">4. Development Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use tools like Email on Acid or Litmus</li>
                <li>• Test with different screen sizes</li>
                <li>• Check accessibility (alt text, contrast)</li>
                <li>• Verify all links work correctly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 