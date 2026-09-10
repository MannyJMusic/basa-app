import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCalendar, icsFilename } from '@/lib/ics'
import { icsResponse, requestOrigin } from '@/lib/ics-response'

/**
 * One event as a download: /events/<slug>/calendar.ics (#56).
 *
 * Drafts are excluded for the same reason the detail page 404s on them.
 */
export const dynamic = 'force-dynamic'

const EVENT_TTL_SECONDS = 300

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await prisma.event.findFirst({
    where: { slug, status: { in: ['PUBLISHED', 'CANCELLED', 'COMPLETED'] } },
  })
  if (!event) {
    return new Response('Event not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
  }

  const body = buildCalendar(
    [{ ...event, description: event.description ?? '' }],
    { origin: requestOrigin(request), calendarName: event.title }
  )
  return icsResponse(body, { filename: icsFilename(event.slug), maxAge: EVENT_TTL_SECONDS })
}
