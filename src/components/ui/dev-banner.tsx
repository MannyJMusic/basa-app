'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bug, 
  X, 
  Mail, 
  ExternalLink,
  Info
} from 'lucide-react'

interface DevBannerProps {
  pageType?: 'payment' | 'membership' | 'general'
}

export function DevBanner({ pageType = 'general' }: DevBannerProps) {
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === 'development')
  }, [])

  if (!isDevelopment || !showBanner) {
    return null
  }

  const getPageSpecificInfo = () => {
    switch (pageType) {
      case 'payment':
        return {
          title: 'Payment Processing',
          description: 'Monitor email sending and payment confirmation',
          links: [
            { label: 'Email Preview', href: '/dev/email-preview' },
            { label: 'Test Webhooks', href: '/dev/test-webhook' }
          ]
        }
      case 'membership':
        return {
          title: 'Membership Registration',
          description: 'Track membership signup and email notifications',
          links: [
            { label: 'Email Preview', href: '/dev/email-preview' },
            { label: 'Test Data', href: '#test-data' }
          ]
        }
      default:
        return {
          title: 'Development Mode',
          description: 'Debugging tools and notifications available',
          links: [
            { label: 'Email Preview', href: '/dev/email-preview' },
            { label: 'Test Webhooks', href: '/dev/test-webhook' }
          ]
        }
    }
  }

  const pageInfo = getPageSpecificInfo()

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bug className="w-5 h-5" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{pageInfo.title}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                DEV MODE
              </Badge>
            </div>
            <p className="text-sm text-orange-100">{pageInfo.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {pageInfo.links.map((link, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => window.open(link.href, '_blank')}
              className="text-white hover:bg-white/10 border-white/20"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {link.label}
            </Button>
          ))}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBanner(false)}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 