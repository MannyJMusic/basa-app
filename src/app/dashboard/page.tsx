import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { EVENT_TIME_ZONE } from "@/lib/event-time"
import {
  countActiveMembers,
  countUpcomingEvents,
  getMyRegistrations,
  getRecentDirectoryMembers,
  getUpcomingEvents,
} from "@/lib/member-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar, Heart, Star, Globe, ArrowRight, Ticket, History } from "lucide-react"
import { GuestOverlay } from "@/components/ui/guest-overlay"
import { WelcomeBanner } from "./welcome-banner"

export const dynamic = "force-dynamic"

const eventWhen = (d: Date) =>
  d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: EVENT_TIME_ZONE,
  })

function daysUntil(d: Date): string {
  const days = Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  if (days <= 0) return "Next event today"
  if (days === 1) return "Next event tomorrow"
  return `Next event in ${days} days`
}

const ROW_COLORS = ["bg-blue-50", "bg-green-50", "bg-amber-50"]
const AVATAR_COLORS = ["bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-purple-100 text-purple-600"]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/dashboard")
  const user = session.user
  const isGuest = user.role === "GUEST"

  const [account, activeMembers, upcomingCount, nextEvents, tickets, recentMembers] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { emailVerified: true, accountStatus: true } }),
    countActiveMembers(),
    countUpcomingEvents(),
    getUpcomingEvents(3),
    getMyRegistrations(user.id, user.email),
    // Guests see this page behind an overlay; do not send them member names.
    isGuest ? Promise.resolve([]) : getRecentDirectoryMembers(3),
  ])
  const bookedIds = new Set(tickets.upcoming.map(r => r.event.slug))

  return (
    <div className="relative min-h-screen space-y-6">
      {account?.emailVerified && account.accountStatus === "ACTIVE" && (
        <WelcomeBanner userId={user.id} firstName={user.firstName || ""} />
      )}

      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || "Member"}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening in your BASA community
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {user.role || "MEMBER"}
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
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">Business owners in BASA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              {nextEvents[0] ? daysUntil(nextEvents[0].startDate) : "None scheduled yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.upcoming.length}</div>
            <p className="text-xs text-muted-foreground">For upcoming events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Booked</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.attendedCount}</div>
            <p className="text-xs text-muted-foreground">Past events</p>
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
              {nextEvents.map((e, i) => (
                <div key={e.id} className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg ${ROW_COLORS[i % ROW_COLORS.length]}`}>
                  <div className="min-w-0">
                    <h4 className="text-base font-medium">{e.title}</h4>
                    <p className="text-sm text-gray-600">{eventWhen(e.startDate)}</p>
                  </div>
                  {bookedIds.has(e.slug) ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Registered</Badge>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/events/${e.slug}/register`}>Register</Link>
                    </Button>
                  )}
                </div>
              ))}
              {nextEvents.length === 0 && (
                <p className="text-sm text-gray-600">No events are scheduled right now.</p>
              )}
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
              {recentMembers.map((m, i) => {
                const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.businessName || "BASA member"
                const initials = name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      <span className="text-sm font-medium">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-medium">{name}</h4>
                      {m.businessName && m.businessName !== name && (
                        <p className="text-sm text-gray-600">{m.businessName}</p>
                      )}
                    </div>
                  </div>
                )
              })}
              {recentMembers.length === 0 && (
                <p className="text-sm text-gray-600">
                  {isGuest ? "The member directory is for BASA members." : "No directory listings yet."}
                </p>
              )}
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/directory">
                Browse Directory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
                Connect with San Antonio&apos;s business leaders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {isGuest && <GuestOverlay />}
    </div>
  )
}
