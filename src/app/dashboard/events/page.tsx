'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Crown, Grid3X3, List, Search } from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { EventsDisplay, type EventsViewMode } from "@/components/events/events-display"

const EVENT_TYPES = [
  { value: "NETWORKING", label: "Networking", color: "bg-blue-100" },
  { value: "RIBBON_CUTTING", label: "Ribbon Cutting", color: "bg-orange-100" },
  { value: "SUMMIT", label: "Summit", color: "bg-green-100" },
  { value: "COMMUNITY", label: "Community", color: "bg-red-100" },
]

export default function DashboardEventsPage() {
  const { data: session } = useSession()
  const { events, loading, fetchEvents } = useEvents()
  const [searchTerm, setSearchTerm] = useState("")
  const [eventType, setEventType] = useState("all")
  const [viewMode, setViewMode] = useState<EventsViewMode>("list")

  // Upcoming events only (anything that has not finished yet), soonest first.
  useEffect(() => {
    fetchEvents({ from: new Date().toISOString() }, 1, 50, "startDate", "asc").catch(() => {})
  }, [fetchEvents])

  const term = searchTerm.trim().toLowerCase()
  const now = new Date()
  const upcomingEvents = events.filter(event => {
    const matchesSearch = !term ||
      (event.title ?? "").toLowerCase().includes(term) ||
      (event.description ?? "").toLowerCase().includes(term) ||
      (event.location ?? "").toLowerCase().includes(term)
    const matchesType = eventType === "all" || event.type === eventType
    return matchesSearch && matchesType && new Date(event.endDate) >= now
  })

  const isGuest = session?.user?.role === "GUEST"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">
            Upcoming BASA events. Your tickets are on your <Link href="/dashboard" className="underline">dashboard</Link>.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/events/calendar">
            <CalendarDays className="w-4 h-4 mr-2" />
            Calendar
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  aria-label="Search events"
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-full" aria-label="Event type">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1"></div>
            <div className="flex justify-end space-x-2 w-full">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                aria-label="List view"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 min-w-0 space-y-6">
          <EventsDisplay
            events={upcomingEvents}
            loading={loading}
            emptyMessage="No upcoming events found."
            viewMode={viewMode}
          />
        </div>

        <div className="w-full lg:w-80 space-y-6">
          {isGuest && (
            <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Membership</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Your membership isn&apos;t active. Members get special rates at BASA networking events.
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/membership">View membership levels</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
              <CardDescription>Click a type to filter events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {EVENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  className={`flex w-full items-center space-x-2 p-2 rounded text-left transition-colors ${
                    eventType === t.value ? "bg-gray-200 ring-2 ring-blue-500" : "hover:bg-gray-50"
                  }`}
                  aria-pressed={eventType === t.value}
                  onClick={() => setEventType(eventType === t.value ? "all" : t.value)}
                >
                  <span className={`w-4 h-4 ${t.color} rounded`}></span>
                  <span className="text-sm">{t.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
