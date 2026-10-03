'use client'

import Link from "next/link"
import { EventImage } from '@/components/events/event-image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { EVENT_TIME_ZONE } from "@/lib/event-time"

interface Event {
  id: string
  title: string
  description?: string | null
  shortDescription?: string | null
  image?: string | null
  venue?: { image?: string | null } | null
  slug: string
  startDate: string
  endDate: string
  location: string
  category?: string | null
  type?: string | null
  isFeatured?: boolean
}

export type EventsViewMode = 'grid' | 'list'

interface EventsDisplayProps {
  /** Already filtered by the caller. */
  events: Event[]
  loading: boolean
  emptyMessage?: string
  viewMode?: EventsViewMode
}

/** Event times are San Antonio wall clock, whatever the viewer's zone. */
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: EVENT_TIME_ZONE })
const endTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { timeStyle: "short", timeZone: EVENT_TIME_ZONE })

const TYPE_LABELS: Record<string, string> = {
  NETWORKING: "Networking",
  SUMMIT: "Summit",
  RIBBON_CUTTING: "Ribbon Cutting",
  COMMUNITY: "Community",
}

const typeLabel = (event: Event) =>
  (event.type && TYPE_LABELS[event.type]) || event.category || null

function summary(event: Event, length: number): string | null {
  if (event.shortDescription) return event.shortDescription
  const text = (event.description ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (!text) return null
  return text.length > length ? `${text.slice(0, length)}...` : text
}

export function EventsDisplay({
  events,
  loading,
  emptyMessage = "No events found.",
  viewMode = 'grid',
}: EventsDisplayProps) {
  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  if (events.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
  }

  const actions = (event: Event) => (
    <>
      <Button asChild size="sm" variant="outline">
        <Link href={`/events/${event.slug}`}>View Details</Link>
      </Button>
      <Button asChild size="sm">
        <Link href={`/events/${event.slug}/register`}>
          <Ticket className="w-4 h-4 mr-1" />
          Register
        </Link>
      </Button>
    </>
  )

  const badges = (event: Event) => (
    <div className="flex flex-wrap items-center gap-2">
      {typeLabel(event) && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">{typeLabel(event)}</Badge>
      )}
      {event.isFeatured && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Featured</Badge>
      )}
    </div>
  )

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {events.map(event => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <EventImage src={event.image ?? event.venue?.image} alt="" className="hidden sm:block h-28 w-28 shrink-0 rounded-md object-cover object-top bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="mb-2">{badges(event)}</div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  {summary(event, 150) && <p className="text-gray-600 mb-3">{summary(event, 150)}</p>}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {when(event.startDate)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 sm:ml-6">{actions(event)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map(event => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <Link href={`/events/${event.slug}`} aria-hidden tabIndex={-1} className="block empty:hidden">
            <EventImage src={event.image ?? event.venue?.image} alt="" className="w-full h-48 object-cover object-top bg-gray-100" />
          </Link>
          <CardHeader>
            {badges(event)}
            <CardTitle className="text-lg">{event.title}</CardTitle>
            {summary(event, 100) && <CardDescription>{summary(event, 100)}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 shrink-0" />
              {when(event.startDate)} - {endTime(event.endDate)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 shrink-0" />
              {event.location}
            </div>
            <div className="flex space-x-2">{actions(event)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
