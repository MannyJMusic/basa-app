// Type-only on purpose: importing the value module pulls in sanitize-html and its
// ESM-only parser chain. The integration jest config runs raw ts-jest with no
// transform for node_modules, so that is a suite that fails to LOAD rather than a
// suite that fails - and this module's job is a Prisma query, not a document.
import type { IcsEvent } from '@/lib/ics'

export interface FeedFilters {
  type?: string | null
  category?: string | null
}

/**
 * Which events belong in the subscribable calendar (#56).
 *
 * Kept out of the route so the rule can be tested against a real database: what
 * a subscriber sees is the whole point of the feed, and it is the part most
 * likely to drift as event statuses gain meanings.
 *
 * - Upcoming by *end* date, not start: an event running until tonight belongs on
 *   the calendar at lunchtime.
 * - Cancelled events stay in, so a subscriber's copy is struck through rather
 *   than quietly disappearing. `buildCalendar` marks them `STATUS:CANCELLED`.
 * - Drafts never appear, for the same reason the detail page 404s on them.
 * - Capped, so a runaway series cannot make the response unbounded.
 */
export const FEED_LIMIT = 500

export async function selectFeedEvents(
  prisma: { event: { findMany: (args: unknown) => Promise<IcsEvent[]> } },
  filters: FeedFilters = {},
  now: Date = new Date()
): Promise<IcsEvent[]> {
  return prisma.event.findMany({
    where: {
      status: { in: ['PUBLISHED', 'CANCELLED'] },
      endDate: { gte: now },
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    },
    orderBy: { startDate: 'asc' },
    take: FEED_LIMIT,
  })
}
