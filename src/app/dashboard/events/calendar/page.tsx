'use client'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Ticket,
} from "lucide-react"
import { useEvents, type Event } from "@/hooks/use-events"
import { EVENT_TIME_ZONE, wallClockToUtc } from "@/lib/event-time"

/** Year, month (0-11) and day of an instant on the San Antonio calendar. */
function chicagoParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE, year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(d)
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
  return { year: get("year"), month: get("month") - 1, day: get("day") }
}

interface MonthRef { year: number; month: number }

const shiftMonth = ({ year, month }: MonthRef, delta: number): MonthRef => {
  // Day 1 avoids the 31st-of-the-month rollover that skipped short months.
  const d = new Date(Date.UTC(year, month + delta, 1))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
}

const formatMonthYear = ({ year, month }: MonthRef) =>
  new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })

const eventTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: EVENT_TIME_ZONE })

const eventWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: EVENT_TIME_ZONE,
  })

const getEventColor = (type: string | undefined) => {
  switch ((type ?? "").toLowerCase()) {
    case "networking": return "bg-blue-100 text-blue-800"
    case "ribbon_cutting": return "bg-orange-100 text-orange-800"
    case "summit": return "bg-green-100 text-green-800"
    case "community": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export default function MemberCalendarPage() {
  const { events, loading, fetchEvents } = useEvents()
  const [current, setCurrent] = useState<MonthRef>(() => {
    const { year, month } = chicagoParts(new Date())
    return { year, month }
  })

  // Load exactly the visible month (San Antonio time) each time it changes.
  useEffect(() => {
    const from = wallClockToUtc(current.year, current.month + 1, 1, 0, 0)
    const next = shiftMonth(current, 1)
    const to = wallClockToUtc(next.year, next.month + 1, 1, 0, 0)
    fetchEvents({ from: from.toISOString(), to: to.toISOString() }, 1, 100, "startDate", "asc")
      .catch(() => {})
  }, [current, fetchEvents])

  // Events that start in the visible month, by San Antonio calendar day.
  const monthEvents = useMemo(
    () =>
      events.filter(e => {
        const p = chicagoParts(new Date(e.startDate))
        return p.year === current.year && p.month === current.month
      }),
    [events, current]
  )

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(current.year, current.month, 1)).getUTCDay()
    const daysInMonth = new Date(Date.UTC(current.year, current.month + 1, 0)).getUTCDate()
    const byDay = new Map<number, Event[]>()
    for (const e of monthEvents) {
      const { day } = chicagoParts(new Date(e.startDate))
      byDay.set(day, [...(byDay.get(day) ?? []), e])
    }
    const days: { day: number | null; events: Event[] }[] = []
    for (let i = 0; i < firstWeekday; i++) days.push({ day: null, events: [] })
    for (let day = 1; day <= daysInMonth; day++) days.push({ day, events: byDay.get(day) ?? [] })
    return days
  }, [current, monthEvents])

  const now = new Date()
  const upcoming = monthEvents.filter(e => new Date(e.endDate) >= now)
  const past = monthEvents.length - upcoming.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
            <p className="text-gray-600 mt-1">Plan your networking schedule and register for events</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/events">Browse All Events</Link>
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrent(c => shiftMonth(c, -1))}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{formatMonthYear(shiftMonth(current, -1))}</span>
            </Button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{formatMonthYear(current)}</h2>
            <Button variant="outline" size="sm" onClick={() => setCurrent(c => shiftMonth(c, 1))}>
              <span className="hidden sm:inline">{formatMonthYear(shiftMonth(current, 1))}</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-lg">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 ${dayData.day ? "bg-white" : "bg-gray-50"}`}
                >
                  {dayData.day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-2">{dayData.day}</div>
                      <div className="space-y-1">
                        {dayData.events.map((event) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.slug}`}
                            className={`block text-xs p-1 rounded hover:opacity-80 transition-opacity ${getEventColor(event.type)}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-75">{eventTime(event.startDate)}</div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Upcoming Events - {formatMonthYear(current)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No upcoming events this month</div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-600">{eventWhen(event.startDate)}</p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/events/${event.slug}/register`}>
                        <Ticket className="w-3 h-3 mr-1" />
                        Register
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month&apos;s Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Events:</span>
                <span className="font-semibold">{monthEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Upcoming Events:</span>
                <span className="font-semibold text-blue-600">{upcoming.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Past Events:</span>
                <span className="font-semibold text-gray-600">{past}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
          <CardDescription>Colors used on the calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["bg-blue-100", "Networking"],
              ["bg-orange-100", "Ribbon Cutting"],
              ["bg-green-100", "Summit"],
              ["bg-red-100", "Community"],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center space-x-2">
                <div className={`w-4 h-4 ${color} rounded`}></div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
