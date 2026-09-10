import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCalendar } from '@/lib/ics'
import { icsResponse, requestOrigin } from '@/lib/ics-response'
import { selectFeedEvents } from '@/lib/ics-feed'

/**
 * The subscribable BASA calendar: /events/calendar.ics (#56).
 *
 * Which events appear is `selectFeedEvents`, kept in a library so it can be
 * tested against a real database. Optional `type` and `category` produce filtered
 * feeds, which cost nothing now the base feed exists.
 */
export const dynamic = 'force-dynamic'

const FEED_TTL_SECONDS = 900

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams
  const type = params.get('type')
  const category = params.get('category')

  const events = await selectFeedEvents(prisma as never, { type, category })

  const origin = requestOrigin(request)
  const name = [
    'BASA Events',
    type ? type.toLowerCase().replace(/_/g, ' ') : null,
    category,
  ].filter(Boolean).join(' - ')

  const body = buildCalendar(
    events.map((event) => ({ ...event, description: event.description ?? '' })),
    { origin, calendarName: name }
  )
  return icsResponse(body, { maxAge: FEED_TTL_SECONDS })
}
