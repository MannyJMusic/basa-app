import { toPlainText } from '@/lib/sanitize-html'

/**
 * Build iCalendar (RFC 5545) documents for BASA events.
 *
 * MEC exposes per-event and whole-calendar iCal and members subscribe to it, so
 * losing it at cutover would be a visible regression (#56).
 *
 * Written by hand rather than pulled from a library because the format is small
 * and the parts that go wrong are the parts a library would hide: CRLF line
 * endings, folding long lines at 75 octets, escaping in text values, and UIDs
 * that stay the same across regeneration so a subscriber updates an entry rather
 * than collecting a second copy of it.
 *
 * Times are emitted as UTC instants (`...Z`) rather than local times with a
 * VTIMEZONE block. Both are valid; UTC is unambiguous, needs no timezone
 * definition to be shipped and kept current, and every calendar client renders it
 * in the viewer's own zone - which is what a member in San Antonio wants anyway.
 */

export interface IcsEvent {
  id: string
  slug: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  category?: string | null
  status: string
  updatedAt: Date
}

export interface IcsOptions {
  /** Absolute origin, for URL properties and the UID domain. */
  origin: string
  /** Shown by clients that name a subscribed calendar. */
  calendarName?: string
}

/** RFC 5545 §3.3.11: backslash, semicolon, comma and newlines are special. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n')
}

/**
 * Fold to 75 octets per line (§3.1), continuing with a leading space.
 *
 * Counted in UTF-8 bytes, not characters: BASA's descriptions are full of emoji,
 * and splitting one across a fold boundary produces a broken entry in some
 * clients rather than a long line.
 */
function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line

  const parts: string[] = []
  let start = 0
  // First line takes 75 octets, continuations take 74 plus the leading space.
  let limit = 75
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length)
    // Do not cut inside a multi-byte character: continuation bytes are 10xxxxxx.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--
    parts.push(bytes.toString('utf8', start, end))
    start = end
    limit = 74
  }
  return parts.join('\r\n ')
}

function formatUtc(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`
}

function line(name: string, value: string): string {
  return foldLine(`${name}:${escapeText(value)}`)
}

/**
 * A stable identifier for one event across every regeneration of the feed.
 *
 * Built from the database id, which never changes, rather than the slug, which
 * an editor can rename - a changed UID makes every subscriber keep the old entry
 * and add a second one beside it.
 */
export function eventUid(event: IcsEvent, origin: string): string {
  return `${event.id}@${origin.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`
}

function locationOf(event: IcsEvent): string {
  const parts = [event.location, event.address, event.city, event.state, event.zipCode]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
  // "Astro Super Bowl" and an address of "Astro Super Bowl" would read twice.
  return parts.filter((part, index) => parts.indexOf(part) === index).join(', ')
}

function eventBlock(event: IcsEvent, opts: IcsOptions, stamp: Date): string[] {
  const description = toPlainText(event.description, 900)
  const url = `${opts.origin.replace(/\/$/, '')}/events/${event.slug}`

  const lines = [
    'BEGIN:VEVENT',
    line('UID', eventUid(event, opts.origin)),
    line('DTSTAMP', formatUtc(stamp)),
    line('DTSTART', formatUtc(event.startDate)),
    line('DTEND', formatUtc(event.endDate)),
    line('SUMMARY', event.title),
  ]
  if (description) lines.push(line('DESCRIPTION', description))
  const location = locationOf(event)
  if (location) lines.push(line('LOCATION', location))
  if (event.category) lines.push(line('CATEGORIES', event.category))

  lines.push(line('URL', url))
  // CANCELLED tells a subscriber to strike the entry rather than silently drop it.
  lines.push(line('STATUS', event.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'))
  lines.push(line('LAST-MODIFIED', formatUtc(event.updatedAt)))
  // Clients only accept an update when the sequence advances. Seconds since the
  // epoch is monotonic and needs no extra column to track revisions.
  lines.push(`SEQUENCE:${Math.floor(event.updatedAt.getTime() / 1000)}`)
  lines.push('END:VEVENT')
  return lines
}

export function buildCalendar(events: IcsEvent[], opts: IcsOptions, now: Date = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Business Association of San Antonio//basa-app//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  if (opts.calendarName) {
    // X-WR-CALNAME is not in the RFC but it is what Google and Apple read.
    lines.push(line('X-WR-CALNAME', opts.calendarName))
    lines.push(line('NAME', opts.calendarName))
  }
  lines.push(line('X-WR-TIMEZONE', 'America/Chicago'))

  for (const event of events) lines.push(...eventBlock(event, opts, now))

  lines.push('END:VCALENDAR')
  // §3.1: lines end CRLF, and the document ends with one.
  return `${lines.join('\r\n')}\r\n`
}

/** A filename a browser will save sensibly. */
export function icsFilename(slug: string): string {
  return `${slug.replace(/[^a-z0-9-]/gi, '-').slice(0, 80) || 'event'}.ics`
}
