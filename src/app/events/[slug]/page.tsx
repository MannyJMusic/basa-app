import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Building } from 'lucide-react'
import { prisma } from '@/lib/db'
import { soldCounts } from '@/lib/ticket-tiers'

// `force-dynamic` was removed as redundant: without generateStaticParams this route
// is already dynamic.
//
// Note for anyone tempted to reintroduce a root `app/loading.tsx`: doing so wraps
// every route in a Suspense boundary, Next flushes the shell before this component
// runs, and notFound() can then only swap the body - the 200 is already committed.
// That is why missing events used to answer 200. Scope loading.tsx to a segment
// that needs it, never the app root.

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    // Draft and cancelled events must not be publicly reachable by guessing a slug.
    where: { slug, status: 'PUBLISHED' },
    include: {
      organizer: true,
      venue: true,
      ticketTiers: { where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] },
      speakers: { orderBy: { order: 'asc' } },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event not found' }
  return {
    title: `${event.title} | BASA`,
    description: event.shortDescription ?? event.description.slice(0, 160),
  }
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
})
const timeFmt = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
})
const money = (v: unknown) =>
  v === null || v === undefined ? null : `$${Number(v).toFixed(2).replace(/\.00$/, '')}`

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)

  // Previously this page ignored the slug entirely and rendered a hardcoded event,
  // so every URL under /events/ returned 200 with fabricated details.
  if (!event) notFound()

  const sold = await soldCounts(event.id)
  const placesLeft = event.capacity === null ? null : Math.max(0, event.capacity - sold.total)
  const isFull = placesLeft === 0
  const isPast = event.endDate < new Date()

  const where = event.venue
    ? [event.venue.name, event.venue.city, event.venue.state].filter(Boolean).join(', ')
    : [event.location, event.city, event.state].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 mr-4">
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-100 text-blue-800">{event.category}</Badge>
              {isPast && <Badge variant="secondary">Past event</Badge>}
              {!isPast && isFull && <Badge className="bg-red-100 text-red-800">Sold out</Badge>}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            {event.shortDescription && (
              <p className="text-xl text-purple-100 leading-relaxed mb-6">{event.shortDescription}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 shrink-0" />
                <span>{dateFmt.format(event.startDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 shrink-0" />
                <span>{timeFmt.format(event.startDate)} &ndash; {timeFmt.format(event.endDate)}</span>
              </div>
              {where && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 shrink-0" />
                  <span>{where}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>About This Event</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
              </CardContent>
            </Card>

            {event.venue && (
              <Card>
                <CardHeader><CardTitle>Venue</CardTitle></CardHeader>
                <CardContent className="text-gray-700">
                  <p className="font-medium">{event.venue.name}</p>
                  {event.venue.address && <p>{event.venue.address}</p>}
                  <p>{[event.venue.city, event.venue.state, event.venue.zipCode].filter(Boolean).join(' ')}</p>
                </CardContent>
              </Card>
            )}

            {event.speakers.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Speakers</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {event.speakers.map(s => (
                    <div key={s.id}>
                      <p className="font-medium">{s.name}{s.title ? `, ${s.title}` : ''}</p>
                      {s.topic && <p className="text-sm text-gray-600">{s.topic}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{isPast ? 'This event has ended' : 'Register'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {event.ticketTiers.length > 0 ? (
                  <div className="space-y-2">
                    {event.ticketTiers.map(t => (
                      <div key={t.id} className="flex justify-between items-baseline">
                        <span className="text-sm">{t.name}</span>
                        <span className="font-semibold">
                          {money(t.memberPrice) && money(t.memberPrice) !== money(t.price)
                            ? `${money(t.memberPrice)} members / ${money(t.price)}`
                            : money(t.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Ticket details to be announced.</p>
                )}

                {placesLeft !== null && !isPast && (
                  <p className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {isFull ? 'No places remaining' : `${placesLeft} of ${event.capacity} places remaining`}
                  </p>
                )}

                {!isPast && !isFull && (
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.slug}/register`}>Register Now</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {event.organizer && (
              <Card>
                <CardHeader><CardTitle>Organizer</CardTitle></CardHeader>
                <CardContent className="text-gray-700">
                  <p className="flex items-center font-medium">
                    <Building className="w-4 h-4 mr-2 shrink-0" />
                    {event.organizer.name}
                  </p>
                  {event.organizer.email && (
                    <p className="text-sm text-gray-600 mt-1">{event.organizer.email}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
