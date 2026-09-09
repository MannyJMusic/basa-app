import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import { prisma } from '@/lib/db'
import { soldCounts } from '@/lib/ticket-tiers'
import { EventRegistrationForm } from '@/components/events/event-registration-form'

// This page previously loaded neither mock nor real data: it fetched
// `/api/events?search=<slug>` client-side and filtered the results, then priced
// tickets in the browser using a 15% "group discount" that exists nowhere in the
// data model. Prices and availability now come from the server, and the server
// re-derives both when the payment is created - the browser cannot set a price.

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      venue: true,
      ticketTiers: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
      },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event not found' }
  return { title: `Register | ${event.title} | BASA` }
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
})
const timeFmt = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
})

export default async function EventRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const sold = await soldCounts(event.id)
  const eventPlacesLeft = event.capacity === null ? null : Math.max(0, event.capacity - sold.total)
  const isPast = event.endDate < new Date()

  const where = event.venue
    ? [event.venue.name, event.venue.city, event.venue.state].filter(Boolean).join(', ')
    : [event.location, event.city, event.state].filter(Boolean).join(', ')

  // Decimal and Date do not survive the server/client boundary, so the tiers are
  // flattened to primitives here rather than passed as Prisma objects.
  const tiers = event.ticketTiers.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    price: Number(t.price),
    memberPrice: t.memberPrice === null ? null : Number(t.memberPrice),
    remaining: t.quantity === null ? null : Math.max(0, t.quantity - (sold.perTier.get(t.id) ?? 0)),
  }))

  const closed = isPast || eventPlacesLeft === 0 || tiers.length === 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/events/${event.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to event
            </Link>
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
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
            </CardContent>
          </Card>

          {closed ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium text-gray-900">
                  {isPast
                    ? 'This event has already taken place.'
                    : eventPlacesLeft === 0
                      ? 'This event is full.'
                      : 'Tickets are not on sale for this event yet.'}
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/events">Browse other events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <EventRegistrationForm
              eventId={event.id}
              eventTitle={event.title}
              tiers={tiers}
              eventPlacesLeft={eventPlacesLeft}
            />
          )}
        </div>
      </div>
    </div>
  )
}
