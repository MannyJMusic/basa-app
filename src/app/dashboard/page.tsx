"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Heart,
  Star,
  Quote,
  Award,
  Handshake,
  Building2,
  MapPin,
  Target,
  CheckCircle,
  Globe,
  Lightbulb,
  Shield,
  ArrowRight
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/sign-in")
      return
    }

    // Check if user was created recently (within last 24 hours)
    const checkNewUser = async () => {
      try {
        const response = await fetch('/api/profile')
        const userData = await response.json()
        
        if (userData.createdAt) {
          const createdAt = new Date(userData.createdAt)
          const now = new Date()
          const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceCreation < 24) {
            setIsNewUser(true)
            setShowWelcome(true)
          }
        }
      } catch (error) {
        console.error('Error checking user data:', error)
      }
    }

    checkNewUser()
  }, [session, status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message for New Users */}
      {showWelcome && isNewUser && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Welcome to BASA, {session.user?.firstName || 'Member'}!</strong> 
            Your account has been successfully created. We're excited to have you join the San Antonio business community. 
            Take a moment to explore your dashboard and complete your profile.
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.firstName || 'Member'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening in your BASA community
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {session.user?.role || 'MEMBER'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150+</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Next event in 3 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Connections</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Available to you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Tech Innovation Summit</h4>
                  <p className="text-sm text-gray-600">March 15, 2024 • 9:00 AM</p>
                </div>
                <Button size="sm" variant="outline">
                  Register
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Networking Mixer</h4>
                  <p className="text-sm text-gray-600">March 22, 2024 • 6:00 PM</p>
                </div>
                <Button size="sm" variant="outline">
                  Register
                </Button>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">JD</span>
                </div>
                <div>
                  <h4 className="font-medium">John Davis</h4>
                  <p className="text-sm text-gray-600">TechCorp Solutions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">SM</span>
                </div>
                <div>
                  <h4 className="font-medium">Sarah Martinez</h4>
                  <p className="text-sm text-gray-600">Innovate Business</p>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Browse Directory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Community Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Community Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Service</h3>
              <p className="text-sm text-gray-600">
                Join our monthly community service initiatives
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Business Growth</h3>
              <p className="text-sm text-gray-600">
                Access resources and mentorship for your business
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Networking</h3>
              <p className="text-sm text-gray-600">
                Connect with San Antonio's business leaders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 