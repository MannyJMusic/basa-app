import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Developer Tools | BASA',
  description: 'Development and testing tools for the BASA application',
}

const devTools = [
  {
    title: 'Email Preview',
    description: 'Preview and send test renders of every email template',
    icon: Mail,
    href: '/dev/email-preview',
    category: 'Email System',
    badge: 'Preview'
  },
  {
    title: 'Email Status',
    description: 'Check email delivery status for a payment',
    icon: Eye,
    href: '/api/dev/email-status',
    category: 'Email System',
    badge: 'API'
  }
]

const categories = ['Email System']

export default function DevToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">BASA Developer Tools</h1>
          <p className="text-xl text-gray-600">
            Development, testing, and debugging tools for the BASA application
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-sm">
              {category}
            </Badge>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card key={tool.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </div>
                    <Badge 
                      variant={tool.badge === 'Demo' ? 'default' : 
                              tool.badge === 'Test' ? 'secondary' : 
                              tool.badge === 'API' ? 'outline' : 'default'}
                      className="text-xs"
                    >
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                    <Button asChild size="sm">
                      <Link href={tool.href}>
                        Open Tool
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Development Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Development Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• These tools are for development and testing purposes only</li>
              <li>• Only available outside production, to signed-in admins</li>
              <li>• API endpoints return JSON responses for programmatic access</li>
              <li>• Demo pages showcase UI components and features</li>
              <li>• Debug tools help troubleshoot authentication and database issues</li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="font-semibold mb-2">External Tools</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      💳 Stripe Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="https://app.mailgun.com/app/account/security/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      📧 Mailgun Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      🐛 Sentry Dashboard
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 