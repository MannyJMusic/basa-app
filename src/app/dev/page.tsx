import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bug, 
  Mail, 
  Database, 
  Code, 
  TestTube, 
  Settings, 
  Eye,
  Activity,
  Users,
  Shield
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Developer Tools | BASA',
  description: 'Development and testing tools for the BASA application',
}

const devTools = [
  {
    title: 'Loading Components Demo',
    description: 'Interactive demo of all loading states and animations',
    icon: Activity,
    href: '/dev/loading-demo',
    category: 'UI Components',
    badge: 'Demo'
  },
  {
    title: 'Technology Stack Demo',
    description: 'Comprehensive showcase of the technology stack',
    icon: Code,
    href: '/dev/tech-demo',
    category: 'Documentation',
    badge: 'Demo'
  },
  {
    title: 'Sentry Error Testing',
    description: 'Test Sentry error tracking and monitoring',
    icon: Bug,
    href: '/dev/sentry-example-page',
    category: 'Monitoring',
    badge: 'Test'
  },
  {
    title: 'Email Preview',
    description: 'Preview and test email templates',
    icon: Mail,
    href: '/dev/email-preview',
    category: 'Email System',
    badge: 'Preview'
  },
  {
    title: 'Test Email',
    description: 'Send test emails to verify delivery',
    icon: Mail,
    href: '/api/dev/test-email',
    category: 'Email System',
    badge: 'API'
  },
  {
    title: 'Email Status',
    description: 'Check email delivery status and logs',
    icon: Eye,
    href: '/api/dev/email-status',
    category: 'Email System',
    badge: 'API'
  },
  {
    title: 'Database Debug',
    description: 'Check database connection and basic stats',
    icon: Database,
    href: '/api/dev/debug-db',
    category: 'Debug',
    badge: 'API'
  },
  {
    title: 'Session Debug',
    description: 'Debug authentication session information',
    icon: Shield,
    href: '/api/dev/debug-session',
    category: 'Debug',
    badge: 'API'
  },
  {
    title: 'Users Debug',
    description: 'Debug user data and guest user information',
    icon: Users,
    href: '/api/dev/debug-users',
    category: 'Debug',
    badge: 'API'
  },
  {
    title: 'Sentry API Test',
    description: 'Test Sentry API error reporting',
    icon: Bug,
    href: '/api/dev/sentry-example-api',
    category: 'Monitoring',
    badge: 'API'
  },
  {
    title: 'Webhook Testing',
    description: 'Test webhook endpoints and payloads',
    icon: TestTube,
    href: '/dev/test-webhook',
    category: 'Testing',
    badge: 'Test'
  },
  {
    title: 'Events API Test',
    description: 'Test events API endpoint directly',
    icon: TestTube,
    href: '/api/events?status=PUBLISHED&sortBy=startDate&sortOrder=asc',
    category: 'Testing',
    badge: 'API'
  },
  {
    title: 'Database Browser',
    description: 'Browse and interact with database tables',
    icon: Database,
    href: '/dev/database',
    category: 'Database',
    badge: 'Demo'
  }
]

const categories = [
  'UI Components',
  'Documentation', 
  'Email System',
  'Debug',
  'Monitoring',
  'Testing',
  'Database'
]

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
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Dev deployment test - Last updated: {new Date().toLocaleString()}
            </p>
          </div>
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
              <li>• Some tools may expose sensitive information - use with caution</li>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Documentation</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link href="/docs" className="text-blue-600 hover:underline">
                      📚 Project Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/TECH_STACK.md" className="text-blue-600 hover:underline">
                      🛠️ Technology Stack
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/DEVELOPER_CONTROL_PANEL.md" className="text-blue-600 hover:underline">
                      ⚙️ Developer Control Panel
                    </Link>
                  </li>
                </ul>
              </div>
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