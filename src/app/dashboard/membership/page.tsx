import Link from "next/link"
import { redirect } from "next/navigation"
import type { Status } from "@prisma/client"
import { auth } from "@/lib/auth"
import { MEMBERSHIP_SALES_ENABLED, OFFICE_CONTACT } from "@/lib/feature-flags"
import { formatTierPrice } from "@/lib/membership-tiers"
import { EVENT_TIME_ZONE } from "@/lib/event-time"
import { getMembershipSummary, getMyRegistrations, getUpcomingEvents } from "@/lib/member-dashboard"
import { MembershipOfficeNotice } from "@/components/membership/MembershipOfficeNotice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Clock, Crown, History, Mail, Phone, Ticket } from "lucide-react"

export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-700" },
  EXPIRED: { label: "Expired", className: "bg-amber-100 text-amber-800" },
  INACTIVE: { label: "Inactive", className: "bg-gray-100 text-gray-700" },
}

const monthYear = (d: Date) => d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: EVENT_TIME_ZONE })
const longDate = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: EVENT_TIME_ZONE })
const eventWhen = (d: Date) =>
  d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: EVENT_TIME_ZONE,
  })

export default async function MembershipPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/dashboard/membership")

  const [summary, tickets] = await Promise.all([
    getMembershipSummary(session.user.id),
    getMyRegistrations(session.user.id, session.user.email),
  ])
  const suggestions = tickets.upcoming.length === 0 ? await getUpcomingEvents(3) : []
  const isActive = summary?.status === "ACTIVE"
  const years = summary ? Math.floor((Date.now() - summary.joinedAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Membership</h1>
          <p className="text-gray-600 mt-2">Your BASA membership, tickets and history</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/membership/benefits">
            Member benefits
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Current Membership Status */}
      <Card className="border-2 border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          {summary ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{summary.planLabel ?? "BASA Membership"}</h2>
                    <Badge variant="secondary" className={STATUS_BADGE[summary.status].className}>
                      {STATUS_BADGE[summary.status].label}
                    </Badge>
                  </div>
                  <p className="text-gray-600">Member since {monthYear(summary.joinedAt)}</p>
                  {summary.chapterName && <p className="text-sm text-gray-500">{summary.chapterName} chapter</p>}
                  {summary.renewalDate && (
                    <p className="text-sm text-gray-500">
                      {isActive ? "Renews" : summary.status === "EXPIRED" ? "Expired" : "Ends"} {longDate(summary.renewalDate)}
                    </p>
                  )}
                </div>
              </div>
              {summary.priceCents != null && summary.priceCents > 0 && (
                <div className="sm:text-right">
                  <p className="text-3xl font-bold text-blue-600">{formatTierPrice(summary.priceCents)}</p>
                  <p className="text-sm text-gray-600">per year</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">No membership on record</h2>
              <p className="text-gray-600 mt-1">
                If you are a BASA member and this looks wrong, contact the office and we will link your membership to this account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isActive && (
        MEMBERSHIP_SALES_ENABLED ? (
          <Card>
            <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-gray-700">
                {summary ? "Your membership is not active." : "Become a member to get member ticket prices and a directory listing."}
              </p>
              <Button asChild>
                <Link href="/membership/join">{summary ? "Renew membership" : "Join BASA"}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <MembershipOfficeNotice variant="card" intent={summary ? "renew" : "join"} />
        )
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{tickets.upcoming.length}</p>
              <p className="text-sm text-gray-600">Upcoming events booked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{tickets.attendedCount}</p>
              <p className="text-sm text-gray-600">Past events booked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{summary ? (years < 1 ? "<1" : years) : "–"}</p>
              <p className="text-sm text-gray-600">{years === 1 ? "Year" : "Years"} with BASA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My tickets, or what is coming up */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>{tickets.upcoming.length ? "Your upcoming events" : "Coming up"}</span>
              </CardTitle>
              {tickets.upcoming.length === 0 && (
                <CardDescription>You have no tickets for upcoming events yet.</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.upcoming.map(r => (
                  <Link
                    key={r.id}
                    href={`/events/${r.event.slug}`}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100"
                  >
                    <div className="min-w-0">
                      <h4 className="text-base font-medium">{r.event.title}</h4>
                      <p className="text-sm text-gray-600">{eventWhen(r.event.startDate)} • {r.event.location}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {r.ticketCount} {r.ticketCount === 1 ? "ticket" : "tickets"}
                    </Badge>
                  </Link>
                ))}
                {suggestions.map(e => (
                  <Link
                    key={e.id}
                    href={`/events/${e.slug}`}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <div className="min-w-0">
                      <h4 className="text-base font-medium">{e.title}</h4>
                      <p className="text-sm text-gray-600">{eventWhen(e.startDate)} • {e.location}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-700">Get tickets</span>
                  </Link>
                ))}
                {tickets.upcoming.length === 0 && suggestions.length === 0 && (
                  <p className="text-sm text-gray-600">No events are scheduled right now.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Membership history (imported from the old site, then kept here) */}
          {summary && summary.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <span>Membership history</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {summary.history.map(h => (
                    <li key={h.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{h.levelName}</p>
                        <p className="text-sm text-gray-600">
                          {h.startedAt ? longDate(h.startedAt) : "Unknown start"}
                          {" – "}
                          {h.endedAt ? longDate(h.endedAt) : "no end date"}
                        </p>
                      </div>
                      <span className="text-sm text-gray-700">{h.priceCents > 0 ? formatTierPrice(h.priceCents) : ""}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/directory">Member Directory</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/membership/compare">Compare Plans</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions about your membership?</CardTitle>
              <CardDescription>{OFFICE_CONTACT.name} at the BASA office can help.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={OFFICE_CONTACT.phoneHref} className="flex items-center space-x-2 text-sm hover:underline">
                <Phone className="w-4 h-4 text-green-600" />
                <span>{OFFICE_CONTACT.phone}</span>
              </a>
              <a href={`mailto:${OFFICE_CONTACT.email}`} className="flex items-center space-x-2 text-sm hover:underline break-all">
                <Mail className="w-4 h-4 text-green-600 shrink-0" />
                <span>{OFFICE_CONTACT.email}</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Changing plans: online only while sales are on; otherwise the office */}
      {isActive && (MEMBERSHIP_SALES_ENABLED ? (
        <Card>
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-gray-700">Want a different membership level?</p>
            <Button asChild variant="outline">
              <Link href="/membership/compare">Compare plans</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MembershipOfficeNotice variant="card" intent="upgrade" />
      ))}
    </div>
  )
}
