import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, UserPlus, Activity, BadgeCheck } from "lucide-react"
import { describeAuditAction, getAdminOverview } from "@/lib/member-dashboard"

export const dynamic = "force-dynamic"

const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

function ago(d: Date): string {
  const minutes = Math.round((Date.now() - d.getTime()) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? "day" : "days"} ago`
}

export default async function AdminPage() {
  const o = await getAdminOverview()

  return (
    <div className="space-y-8">
      {o.pendingRateRequests > 0 && (
        <Link
          href="/admin/member-rate-requests"
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 hover:bg-amber-100"
        >
          <BadgeCheck className="w-5 h-5 shrink-0" />
          <span>
            {o.pendingRateRequests} member-rate {o.pendingRateRequests === 1 ? "request is" : "requests are"} waiting for a decision.
          </span>
        </Link>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{o.activeMembers}</div>
            <p className="text-xs text-muted-foreground">+{o.newMembers} joined in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{o.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">{o.eventsLastMonth} held in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dollars(o.ticketRevenueCents)}</div>
            <p className="text-xs text-muted-foreground">{dollars(o.ticketRevenueMonthCents)} in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Leads</CardTitle>
            <UserPlus className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{o.openLeads}</div>
            <p className="text-xs text-muted-foreground">{o.newLeads} received in the last 30 days</p>
          </CardContent>
        </Card>
      </div>
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-700" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {o.activity.length === 0 ? (
            <p className="text-sm text-gray-600">Nothing recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 text-sm">
              {o.activity.map(a => {
                const who = [a.user?.firstName, a.user?.lastName].filter(Boolean).join(" ") || a.user?.email
                return (
                  <li key={a.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {describeAuditAction(a.action)}
                      {who && <> by <b>{who}</b></>}
                    </span>
                    <span className="text-xs text-gray-500">{ago(a.timestamp)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
