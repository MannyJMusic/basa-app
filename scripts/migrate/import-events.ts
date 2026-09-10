/**
 * Import MEC events, venues and organizers from a WordPress dump (#57).
 *
 *   pnpm migrate:events                          # dry run against the newest dump
 *   pnpm migrate:events --commit                 # actually write
 *   pnpm migrate:events --dump path/to.sql.gz    # a specific dump
 *   pnpm migrate:events --images ./media         # also fetch the featured images
 *
 * Dry run is the default and writes nothing. Every write is an upsert keyed on the
 * WordPress id, so a second run reports everything unchanged; that is the check
 * that the mapping is stable, and it is worth doing after every change here.
 *
 * The source is a mysqldump rather than the WP REST API on purpose:
 *
 *  - MEC keeps venues and organizers as taxonomy TERMS with the address, latitude
 *    and longitude in term meta. The `mec_location` / `mec_organizer` post types
 *    that the `basa-mec-api` plugin exposes over REST carry none of that data on
 *    this site - all twelve location posts have no meta at all.
 *  - The plugin is being deleted with the AI crew (#36), and the WordPress site
 *    itself is being retired (#71). A dump keeps this re-runnable afterwards.
 */
import { PrismaClient, Prisma, EventStatus } from '@prisma/client'
import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { loadWordPress, metaOf, WpSource, WpTerm } from './lib/wp-source'
import { phpUnserializeMap, phpString, PhpValue } from './lib/php-unserialize'
import { decodeEntities, parseUsAddress, summarise, collapseWhitespace } from './lib/text'
import { wallClockToUtc, to24Hour, wallClockPartsInEventZone } from './lib/timezone'
import { MigrationReport, parseArgs } from './lib/report'

const prisma = new PrismaClient()

/** MEC categories that describe what an event is, mapped to basa-app's own type. */
const TYPE_BY_CATEGORY: Record<string, string> = {
  'happy-hour-mixer': 'NETWORKING',
  'breakfast-meetup': 'NETWORKING',
  'networking-events': 'NETWORKING',
  'speed-networking': 'NETWORKING',
  'business-lunch': 'NETWORKING',
  'virtual-events': 'NETWORKING',
  'ribbon-cutting': 'RIBBON_CUTTING',
  'golf-tounaments': 'COMMUNITY',
  'professional-development': 'SUMMIT',
}

/** Categories that say which chapter an event belongs to, not what it is. */
const CHAPTER_CATEGORIES = new Set(['all-chapters', 'south-side', 'center-of-the-city', 'stone-oak'])
/** Categories that only restate the ticket price. */
const PRICING_CATEGORIES = new Set(['free-events', 'paid-events'])

/** A few event titles were typed with markup in them ("<center>...</center>"). */
function plainTitle(raw: string): string {
  return collapseWhitespace(decodeEntities(raw.replace(/<[^>]+>/g, ' ')))
}

/**
 * MEC writes this when an event has no organizer. It is term 1, which on this site
 * is a `category` term ("BASA News") and not an organizer at all - 258 of the 259
 * published events point at it.
 */
const MEC_NO_ORGANIZER = 1
/** The same sentinel for a location: 52 published events carry it. */
const MEC_NO_LOCATION = 1

/**
 * Above this many dates, a "series" is not an event series.
 *
 * Two posts in this dump - "Deadline for Members To Members Email" and "Deadline
 * for Social Content on BASA Pages" - are internal reminders that someone put on
 * the events calendar with no end date. MEC has expanded each into 600 weekly
 * dates running to 2033, which between them are 1,200 of the 1,474 rows in
 * wp_mec_dates. Importing those would bury the public calendar in something no
 * member should see. They come over as the single events they effectively are,
 * and the report says so.
 */
const MAX_SERIES_OCCURRENCES = 24

interface Options {
  dumpPath: string
  commit: boolean
  imageDir: string | null
  limit: number | null
}

function newestDump(): string {
  const dir = join(process.cwd(), 'backups', 'mysql')
  if (!existsSync(dir)) {
    throw new Error(
      `no dump given and ${dir} does not exist - run scripts/pull-backups.sh first`
    )
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql.gz')).sort()
  if (!files.length) throw new Error(`no *.sql.gz in ${dir} - run scripts/pull-backups.sh`)
  return join(dir, files[files.length - 1])
}

function readOptions(): Options {
  const { flags, values } = parseArgs(process.argv.slice(2))
  return {
    dumpPath: values.dump ?? newestDump(),
    commit: flags.has('commit'),
    imageDir: values.images ?? null,
    limit: values.limit ? parseInt(values.limit, 10) : null,
  }
}

/** Which of `desired`'s fields differ from what is already stored. */
function changedFields(existing: Record<string, unknown>, desired: Record<string, unknown>): string[] {
  const changed: string[] = []
  for (const key of Object.keys(desired)) {
    const before = existing[key]
    const after = desired[key]

    if (before instanceof Date || after instanceof Date) {
      const b = before instanceof Date ? before.getTime() : null
      const a = after instanceof Date ? after.getTime() : null
      if (b !== a) changed.push(key)
      continue
    }
    if (Array.isArray(before) || Array.isArray(after)) {
      if (JSON.stringify(before ?? []) !== JSON.stringify(after ?? [])) changed.push(key)
      continue
    }
    // Prisma Decimal compares as an object; compare numerically instead.
    if (before instanceof Prisma.Decimal || after instanceof Prisma.Decimal) {
      const b = before === null || before === undefined ? null : Number(before)
      const a = after === null || after === undefined ? null : Number(after)
      if (b !== a) changed.push(key)
      continue
    }
    if ((before ?? null) !== (after ?? null)) changed.push(key)
  }
  return changed
}

// ---------------------------------------------------------------- venues

/** A latitude/longitude MEC filled in with zeroes, or with something impossible. */
function usableCoordinate(lat: string, lng: string): { latitude: number; longitude: number } | null {
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude === 0 && longitude === 0) return null
  // Every BASA venue is in or near San Antonio. One venue has coordinates in
  // Uganda, which is a typo rather than data, and a wrong pin is worse than none.
  if (latitude < 25 || latitude > 37 || longitude < -107 || longitude > -93) return null
  return { latitude, longitude }
}

async function importVenues(src: WpSource, report: MigrationReport, opts: Options): Promise<Map<number, string>> {
  const idByWpId = new Map<number, string>()
  const terms = src.termsByTaxonomy.get('mec_location') ?? []
  const seenNames = new Map<string, number>()

  for (const term of terms) {
    const name = collapseWhitespace(decodeEntities(term.name))
    if (!name) {
      report.issue('venue has no name', `term ${term.id}`)
      report.tally('venues', 'skipped')
      continue
    }

    const firstUse = seenNames.get(name.toLowerCase())
    if (firstUse !== undefined) {
      report.issue('venues share a name (kept both, merge by hand)', `"${name}" terms ${firstUse} and ${term.id}`)
    } else {
      seenNames.set(name.toLowerCase(), term.id)
    }

    const rawAddress = term.meta.address ?? ''
    const parsed = parseUsAddress(rawAddress)
    if (rawAddress.trim() && !parsed.zipCode && !parsed.city) {
      report.issue('venue address could not be split into city/zip', `${term.id} "${name}": ${collapseWhitespace(rawAddress)}`)
    }
    const coords = usableCoordinate(term.meta.latitude ?? '', term.meta.longitude ?? '')
    if (!coords && (term.meta.latitude ?? '0') !== '0') {
      report.issue('venue coordinates discarded as implausible', `${term.id} "${name}": ${term.meta.latitude}, ${term.meta.longitude}`)
    }
    const website = (term.meta.url ?? '').trim() || null
    const desired = {
      name,
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
      website,
      image: canonicalUrl(src, (term.meta.thumbnail ?? '').trim()),
    }

    const existing = await prisma.venue.findUnique({ where: { wpId: term.id } })
    if (!existing) {
      report.tally('venues', 'created')
      if (opts.commit) {
        const created = await prisma.venue.create({ data: { ...desired, wpId: term.id } })
        idByWpId.set(term.id, created.id)
      }
      continue
    }

    idByWpId.set(term.id, existing.id)
    const changed = changedFields(existing as unknown as Record<string, unknown>, desired)
    if (!changed.length) {
      report.tally('venues', 'unchanged')
      continue
    }
    report.tally('venues', 'updated')
    if (opts.commit) await prisma.venue.update({ where: { id: existing.id }, data: desired })
  }

  return idByWpId
}

// ------------------------------------------------------------ organizers

async function importOrganizers(src: WpSource, report: MigrationReport, opts: Options): Promise<Map<number, string>> {
  const idByWpId = new Map<number, string>()

  for (const term of src.termsByTaxonomy.get('mec_organizer') ?? []) {
    const name = collapseWhitespace(decodeEntities(term.name))
    if (!name) {
      report.tally('organizers', 'skipped')
      continue
    }
    const desired = {
      name,
      email: (term.meta.email ?? '').trim() || null,
      phone: (term.meta.tel ?? '').trim() || null,
      website: (term.meta.url ?? '').trim() || null,
    }

    const existing = await prisma.organizer.findUnique({ where: { wpId: term.id } })
    if (!existing) {
      report.tally('organizers', 'created')
      if (opts.commit) {
        const created = await prisma.organizer.create({ data: { ...desired, wpId: term.id } })
        idByWpId.set(term.id, created.id)
      }
      continue
    }
    idByWpId.set(term.id, existing.id)
    if (!changedFields(existing as unknown as Record<string, unknown>, desired).length) {
      report.tally('organizers', 'unchanged')
      continue
    }
    report.tally('organizers', 'updated')
    if (opts.commit) await prisma.organizer.update({ where: { id: existing.id }, data: desired })
  }

  // The `mec_organizer` POST type holds seven more names, but nothing references
  // them and they carry no contact meta, so importing them would create orphans.
  const orphanPosts = (src.postsByType.get('mec_organizer') ?? []).length
  if (orphanPosts) {
    report.note(
      `${orphanPosts} mec_organizer posts skipped: no event references them and they have no contact details ` +
      `(MEC events point at organizer TERMS, of which this site has one)`
    )
  }

  return idByWpId
}

// ---------------------------------------------------------------- events

/** One materialized date from `wp_mec_dates`. */
interface MecDate {
  startDate: string
  endDate: string
}

/** Everything the importer writes for one event, parent or occurrence alike. */
interface DesiredEvent {
  title: string
  slug: string
  description: string
  shortDescription: string | null
  startDate: Date
  endDate: Date
  location: string
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  capacity: number | null
  price: number | null
  memberPrice: number | null
  category: string
  type: string
  status: EventStatus
  image: string | null
  tags: string[]
  venueId: string | null
  organizerId: string | null
}

interface EventDates {
  startDate: Date
  endDate: Date
  allDay: boolean
}

function readDates(meta: Record<string, string>, report: MigrationReport, label: string): EventDates | null {
  const startDate = (meta.mec_start_date ?? '').trim()
  const endDate = (meta.mec_end_date ?? '').trim() || startDate
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null

  const allDay = meta.mec_allday === '1'
  const start = allDay
    ? { hour: 0, minute: 0 }
    : to24Hour(meta.mec_start_time_hour ?? '', meta.mec_start_time_minutes ?? '0', meta.mec_start_time_ampm ?? '')
  const end = allDay
    ? { hour: 23, minute: 59 }
    : to24Hour(meta.mec_end_time_hour ?? '', meta.mec_end_time_minutes ?? '0', meta.mec_end_time_ampm ?? '')
  if (!start || !end) return null

  // MEC also stores the times as seconds past midnight. Disagreement between the
  // two means the event was edited by something that only wrote one of them.
  const startSeconds = parseInt(meta.mec_start_day_seconds ?? '', 10)
  if (!allDay && Number.isFinite(startSeconds) && startSeconds !== start.hour * 3600 + start.minute * 60) {
    report.issue(
      'MEC start time disagrees with itself (used the hour/minute fields)',
      `${label}: fields say ${start.hour}:${String(start.minute).padStart(2, '0')}, ` +
      `mec_start_day_seconds says ${Math.floor(startSeconds / 3600)}:${String(Math.floor((startSeconds % 3600) / 60)).padStart(2, '0')}`
    )
  }

  const [sy, sm, sd] = startDate.split('-').map((n) => parseInt(n, 10))
  const [ey, em, ed] = (/^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : startDate).split('-').map((n) => parseInt(n, 10))

  return {
    startDate: wallClockToUtc(sy, sm, sd, start.hour, start.minute),
    endDate: wallClockToUtc(ey, em, ed, end.hour, end.minute),
    allDay,
  }
}

interface Categorised {
  category: string
  type: string
  tags: string[]
}

function categorise(src: WpSource, postId: number): Categorised {
  const termIds = src.termsOfPost.get(postId) ?? []
  const categories: WpTerm[] = []
  const tags: string[] = []

  for (const id of termIds) {
    const term = src.terms.get(id)
    if (!term) continue
    if (term.taxonomy === 'mec_category') categories.push(term)
    else if (term.taxonomy === 'post_tag') tags.push(decodeEntities(term.name))
  }

  const descriptive = categories.filter(
    (c) => !CHAPTER_CATEGORIES.has(c.slug) && !PRICING_CATEGORIES.has(c.slug)
  )
  // Chapter and price categories are real information, just not what the event
  // "is". They ride along as tags until events get a Chapter relation of their own.
  for (const c of categories) {
    if (CHAPTER_CATEGORIES.has(c.slug) || PRICING_CATEGORIES.has(c.slug)) tags.push(decodeEntities(c.name))
  }

  const primary = descriptive[0]
  return {
    category: primary ? decodeEntities(primary.name) : 'Networking',
    type: (primary && TYPE_BY_CATEGORY[primary.slug]) ?? 'NETWORKING',
    tags: Array.from(new Set(tags)).sort(),
  }
}

interface MappedTicket {
  wpId: number
  name: string
  description: string | null
  price: number
  quantity: number | null
  sortOrder: number
}

function readTickets(meta: Record<string, string>, report: MigrationReport, label: string): MappedTicket[] {
  let raw: Record<string, PhpValue>
  try {
    raw = phpUnserializeMap(meta.mec_tickets)
  } catch (err) {
    report.issue('ticket data could not be read', `${label}: ${(err as Error).message}`)
    return []
  }

  const tickets: MappedTicket[] = []
  let sortOrder = 0
  for (const key of Object.keys(raw)) {
    const value = raw[key]
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
    const ticket = value as Record<string, PhpValue>

    const name = collapseWhitespace(decodeEntities(phpString(ticket, 'name')))
    if (!name) {
      report.issue('ticket has no name', `${label}: ticket ${key}`)
      continue
    }
    const price = readTicketPrice(phpString(ticket, 'price'))
    if (price === null) {
      report.issue('ticket has no readable price', `${label}: "${name}" price=${JSON.stringify(phpString(ticket, 'price'))}`)
      continue
    }

    const unlimited = phpString(ticket, 'unlimited') === '1'
    const limit = parseInt(phpString(ticket, 'limit'), 10)
    const description = decodeEntities(phpString(ticket, 'description')).trim() || null

    tickets.push({
      wpId: parseInt(key, 10),
      name,
      description,
      price,
      quantity: unlimited || !Number.isFinite(limit) || limit <= 0 ? null : limit,
      sortOrder: sortOrder++,
    })
  }
  return tickets
}

/**
 * MEC's ticket price is free text. Editors have typed "25", "$25", "FREE" and left
 * it blank, and blank is how MEC itself writes a free ticket - so an unreadable
 * price is not the same thing as a missing one.
 */
function readTicketPrice(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '')
  if (!cleaned || /^free$/i.test(cleaned)) return 0
  const price = parseFloat(cleaned)
  return Number.isFinite(price) && price >= 0 ? price : null
}

/** MEC sells member and non-member seats as separate tickets; Event has one of each. */
function headlinePrices(tickets: MappedTicket[]): { price: number | null; memberPrice: number | null } {
  if (!tickets.length) return { price: null, memberPrice: null }
  const isMemberTicket = (t: MappedTicket): boolean =>
    /member/i.test(t.name) && !/future|non-?member|guest|prospect/i.test(t.name)

  const member = tickets.filter(isMemberTicket).map((t) => t.price)
  const general = tickets.filter((t) => !isMemberTicket(t)).map((t) => t.price)
  const min = (values: number[]): number | null => (values.length ? Math.min.apply(null, values) : null)

  return {
    price: min(general.length ? general : tickets.map((t) => t.price)),
    memberPrice: min(member),
  }
}

function capacityOf(meta: Record<string, string>): number | null {
  const booking = phpUnserializeMap(meta.mec_booking)
  if (phpString(booking, 'bookings_limit_unlimited') === '1') return null
  const limit = parseInt(phpString(booking, 'bookings_limit'), 10)
  return Number.isFinite(limit) && limit > 0 ? limit : null
}

/**
 * Attachment and venue-photo URLs on this site still point at
 * `member.businessassociationsa.com`, a hostname the site no longer answers on.
 * Everything imported is rewritten to the canonical site URL.
 */
function canonicalUrl(src: WpSource, url: string): string | null {
  if (!url) return null
  const siteUrl = (src.options.siteurl || 'https://businessassociationsa.com').replace(/\/$/, '')
  return url.replace(/^https?:\/\/[^/]+/, siteUrl)
}

/**
 * The public URL of an event's featured image. Attachment `guid` values on this
 * site still point at `member.businessassociationsa.com`, an old hostname, so the
 * path is rebuilt from `_wp_attached_file` against the canonical site URL.
 */
function featuredImage(src: WpSource, postId: number): string | null {
  const thumbId = parseInt(metaOf(src, postId)._thumbnail_id ?? '', 10)
  if (!Number.isFinite(thumbId)) return null
  const attachment = src.posts.get(thumbId)
  if (!attachment) return null

  const siteUrl = (src.options.siteurl || 'https://businessassociationsa.com').replace(/\/$/, '')
  const file = metaOf(src, thumbId)._wp_attached_file
  if (file) return `${siteUrl}/wp-content/uploads/${file}`
  if (attachment.guid) return attachment.guid.replace(/^https?:\/\/[^/]+/, siteUrl)
  return null
}

/**
 * Which venue an event happens at.
 *
 * `mec_location_id` normally holds a `mec_location` TERM id, and that is where the
 * address lives. Two events instead hold the id of a `mec_location` POST - MEC's
 * newer editor writes those - and those posts carry no address meta on this site.
 * The taxonomy assignment on the event is the last resort, and is set on fewer
 * events than the meta is.
 */
function resolveVenue(
  src: WpSource,
  postId: number,
  meta: Record<string, string>,
  report: MigrationReport,
  label: string
): { venue: WpTerm | undefined; fallbackName: string | null } {
  const locationId = parseInt(meta.mec_location_id ?? '', 10)
  const hasLocationId = Number.isFinite(locationId) && locationId > 0 && locationId !== MEC_NO_LOCATION

  if (hasLocationId) {
    const term = src.terms.get(locationId)
    if (term && term.taxonomy === 'mec_location') return { venue: term, fallbackName: null }
  }

  const tagged = (src.termsOfPost.get(postId) ?? [])
    .map((id) => src.terms.get(id))
    .filter((t): t is WpTerm => !!t && t.taxonomy === 'mec_location')
  if (tagged.length) {
    if (hasLocationId) {
      report.issue(
        "mec_location_id is not a location term; used the event's location tag instead",
        `${label}: mec_location_id=${locationId} -> "${collapseWhitespace(decodeEntities(tagged[0].name))}"`
      )
    }
    return { venue: tagged[0], fallbackName: null }
  }

  // A mec_location POST, which has a usable name and nothing else.
  const locationPost = hasLocationId ? src.posts.get(locationId) : undefined
  if (locationPost && locationPost.type === 'mec_location') {
    const name = plainTitle(locationPost.title)
    report.issue(
      'venue is a mec_location post with no address; kept the name only',
      `${label}: "${name}" (post ${locationId})`
    )
    return { venue: undefined, fallbackName: name || null }
  }

  if (hasLocationId) {
    report.issue('event points at a venue that does not exist', `${label}: mec_location_id=${locationId}`)
  }
  return { venue: undefined, fallbackName: null }
}

async function importEvents(
  src: WpSource,
  occurrencesByPost: Map<number, MecDate[]>,
  venueIds: Map<number, string>,
  organizerIds: Map<number, string>,
  report: MigrationReport,
  opts: Options
): Promise<string[]> {
  const imageUrls: string[] = []
  const posts = (src.postsByType.get('mec-events') ?? []).sort((a, b) => a.id - b.id)
  let handled = 0
  let noOrganizer = 0
  let noVenue = 0
  let seriesCount = 0

  for (const post of posts) {
    if (opts.limit !== null && handled >= opts.limit) break

    const label = `${post.id} "${plainTitle(post.title).slice(0, 60)}"`
    if (post.status === 'trash') {
      report.tally('events', 'skipped')
      report.issue('event is in the WordPress trash', label)
      continue
    }
    if (post.status !== 'publish' && post.status !== 'draft') {
      report.tally('events', 'skipped')
      report.issue(`event has status "${post.status}"`, label)
      continue
    }

    const meta = metaOf(src, post.id)
    const dates = readDates(meta, report, label)
    if (!dates) {
      report.tally('events', 'skipped')
      report.issue('event has no readable start date or time', label)
      continue
    }
    handled++

    // MEC's repeat *rules* are not trustworthy on this site - eight events carry an
    // `until` that predates their own start date - so what counts as a series is
    // what MEC actually materialized into wp_mec_dates. See the comment on #55.
    const materialized = occurrencesByPost.get(post.id) ?? []
    let laterOccurrences: MecDate[] = []

    if (materialized.length > MAX_SERIES_OCCURRENCES) {
      report.issue(
        'not an event series: too many dates to be a real event, imported as one',
        `${label}: ${materialized.length} dates, ${materialized[0].startDate} to ${materialized[materialized.length - 1].startDate}`
      )
    } else if (materialized.length > 1) {
      laterOccurrences = materialized.slice(1)
      seriesCount++
    } else if (meta.mec_repeat_status === '1') {
      report.issue(
        'repeat rule produces nothing (ends before the event starts), imported as one event',
        `${label}: repeats ${meta.mec_repeat_type || 'daily'} until ${meta.mec_repeat_end_at_date || 'never'}, starts ${meta.mec_start_date}`
      )
    }

    const { venue, fallbackName } = resolveVenue(src, post.id, meta, report, label)
    const venueAddress = venue ? parseUsAddress(venue.meta.address ?? '') : null
    if (!venue && !fallbackName && post.status === 'publish') noVenue++

    const organizerTermId = parseInt(meta.mec_organizer_id ?? '', 10)
    if (organizerTermId === MEC_NO_ORGANIZER) noOrganizer++

    const { category, type, tags } = categorise(src, post.id)
    const tickets = readTickets(meta, report, label)
    const { price, memberPrice } = headlinePrices(tickets)
    const image = featuredImage(src, post.id)
    if (image) imageUrls.push(image)
    else if (post.status === 'publish') report.issue('event has no featured image', label)

    const venueName = venue ? collapseWhitespace(decodeEntities(venue.name)) : null
    const status: EventStatus = meta.mec_event_status === 'EventCancelled'
      ? EventStatus.CANCELLED
      : post.status === 'publish' ? EventStatus.PUBLISHED : EventStatus.DRAFT

    const desired: DesiredEvent = {
      title: plainTitle(post.title),
      slug: post.slug || `wp-event-${post.id}`,
      description: post.content,
      shortDescription: decodeEntities(post.excerpt).trim() || summarise(post.content),
      startDate: dates.startDate,
      endDate: dates.endDate,
      location: venueName ?? fallbackName ?? 'To be announced',
      address: venueAddress ? venueAddress.address : null,
      city: venueAddress ? venueAddress.city : null,
      state: venueAddress ? venueAddress.state : null,
      zipCode: venueAddress ? venueAddress.zipCode : null,
      capacity: capacityOf(meta),
      price,
      memberPrice,
      category,
      type,
      status,
      image,
      tags,
      venueId: venue ? venueIds.get(venue.id) ?? null : null,
      organizerId: organizerTermId === MEC_NO_ORGANIZER ? null : organizerIds.get(organizerTermId) ?? null,
    }

    const existing = await prisma.event.findUnique({ where: { wpId: post.id } })

    // A slug already taken by an event that came from somewhere else would fail
    // the unique index mid-run; say so up front instead.
    if (!existing) {
      const slugOwner = await prisma.event.findUnique({ where: { slug: desired.slug } })
      if (slugOwner) {
        report.tally('events', 'skipped')
        report.issue(
          'slug already belongs to a different event',
          `${label}: slug "${desired.slug}" is event ${slugOwner.id} (wpId ${slugOwner.wpId ?? 'none'})`
        )
        continue
      }
      report.tally('events', 'created')
      if (opts.commit) {
        const created = await prisma.event.create({ data: { ...desired, wpId: post.id } })
        await syncTickets(created.id, tickets, report, opts)
        await syncOccurrences(created.id, desired, laterOccurrences, tickets, report, opts)
      } else {
        tickets.forEach(() => report.tally('ticket tiers', 'created'))
        laterOccurrences.forEach(() => report.tally('occurrences', 'created'))
      }
      continue
    }

    const changed = changedFields(
      existing as unknown as Record<string, unknown>,
      desired as unknown as Record<string, unknown>
    )
    if (changed.length) {
      report.tally('events', 'updated')
      if (opts.commit) await prisma.event.update({ where: { id: existing.id }, data: desired })
    } else {
      report.tally('events', 'unchanged')
    }
    await syncTickets(existing.id, tickets, report, opts)
    await syncOccurrences(existing.id, desired, laterOccurrences, tickets, report, opts)
  }

  if (seriesCount) {
    report.note(
      `${seriesCount} events happen on more than one date and import as a series: the first date is the event ` +
      `itself and the rest are occurrences hanging off it. Every genuine occurrence in this data is in the past. ` +
      `An occurrence that already exists is left completely alone on a re-run - including its ticket tiers, ` +
      `which is why the tier count on a first run is higher than on the ones after it.`
    )
  }
  if (noVenue) {
    report.note(
      `${noVenue} published events have no venue: MEC stored location id 1 on them, its "none selected" ` +
      `value, and they carry no location tag either. They import with location "To be announced".`
    )
  }
  if (noOrganizer) {
    report.note(
      `${noOrganizer} events import with no organizer: MEC stored organizer id 1 on them, which is its ` +
      `"none selected" value. Assigning a default BASA organizer is a decision for the owner, not the importer.`
    )
  }
  report.note(`Times read as America/Chicago wall clock and stored as UTC. ` +
    `The WordPress site's own timezone is America/Mexico_City, which is wrong for San Antonio and was ignored.`)

  return imageUrls
}

/**
 * Create the later dates of a series as their own events.
 *
 * The first date is the event itself, so this handles dates two onwards. Each one
 * is a full Event row: registrations, capacity and ticket tiers all attach per
 * occurrence, which is the whole point of not flattening a series into one row.
 *
 * Times come from the parent event rather than from `wp_mec_dates`. That table
 * stores absolute timestamps MEC computed using the WordPress site's own timezone,
 * which is `America/Mexico_City` and wrong for San Antonio - from October 2022,
 * when Mexico dropped daylight saving, those timestamps drift an hour from Central
 * for half the year. Taking the date from MEC and the time of day from the event
 * keeps an 8:00 AM meeting at 8:00 AM on every date.
 */
async function syncOccurrences(
  parentId: string,
  parent: DesiredEvent,
  dates: MecDate[],
  tickets: MappedTicket[],
  report: MigrationReport,
  opts: Options
): Promise<void> {
  if (!dates.length) return

  const startWall = wallClockPartsInEventZone(parent.startDate)
  const endWall = wallClockPartsInEventZone(parent.endDate)
  // A series occurrence keeps the parent's length, including one that runs past
  // midnight: MEC's own dend is unreliable for the same timezone reason.
  const dayspan = Math.round(
    (Date.UTC(endWall.year, endWall.month - 1, endWall.day) -
      Date.UTC(startWall.year, startWall.month - 1, startWall.day)) / 86400000
  )

  for (const date of dates) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.startDate)
    if (!parts) {
      report.issue('occurrence has an unreadable date', `${parent.title}: ${date.startDate}`)
      continue
    }
    const [year, month, day] = parts.slice(1).map((n) => parseInt(n, 10))
    const startDate = wallClockToUtc(year, month, day, startWall.hour, startWall.minute)
    const endBase = new Date(Date.UTC(year, month - 1, day + dayspan))
    const endDate = wallClockToUtc(
      endBase.getUTCFullYear(), endBase.getUTCMonth() + 1, endBase.getUTCDate(),
      endWall.hour, endWall.minute
    )

    const existing = opts.commit
      ? await prisma.event.findUnique({
          where: { parentEventId_occurrenceStart: { parentEventId: parentId, occurrenceStart: startDate } },
        })
      : null

    if (existing) {
      // Never rewritten. An occurrence that was moved or cancelled by hand has to
      // survive a re-import, which is what makes editing one of them meaningful.
      report.tally('occurrences', 'unchanged')
      continue
    }

    report.tally('occurrences', 'created')
    if (!opts.commit) continue

    const created = await prisma.event.create({
      data: {
        ...parent,
        slug: `${parent.slug}-${date.startDate}`,
        startDate,
        endDate,
        parentEventId: parentId,
        occurrenceStart: startDate,
        // Only the parent carries the WordPress id: one post, one wpId.
        wpId: null,
      },
    })
    await syncTickets(created.id, tickets, report, opts)
  }
}

async function syncTickets(
  eventId: string,
  tickets: MappedTicket[],
  report: MigrationReport,
  opts: Options
): Promise<void> {
  const existing = await prisma.ticketTier.findMany({ where: { eventId } })
  const byWpId = new Map<number, (typeof existing)[number]>()
  for (const tier of existing) if (tier.wpId !== null) byWpId.set(tier.wpId, tier)

  for (const ticket of tickets) {
    const desired = {
      name: ticket.name,
      description: ticket.description,
      price: new Prisma.Decimal(ticket.price),
      quantity: ticket.quantity,
      sortOrder: ticket.sortOrder,
      isActive: true,
    }
    const found = byWpId.get(ticket.wpId)
    if (!found) {
      report.tally('ticket tiers', 'created')
      if (opts.commit) await prisma.ticketTier.create({ data: { ...desired, eventId, wpId: ticket.wpId } })
      continue
    }
    if (changedFields(found as unknown as Record<string, unknown>, desired).length) {
      report.tally('ticket tiers', 'updated')
      if (opts.commit) await prisma.ticketTier.update({ where: { id: found.id }, data: desired })
    } else {
      report.tally('ticket tiers', 'unchanged')
    }
  }

  // A tier removed upstream is deactivated rather than deleted: someone may
  // already hold a ticket bought against it, and EventRegistrationItem points at it.
  const wanted = new Set(tickets.map((t) => t.wpId))
  for (const tier of existing) {
    if (tier.wpId === null || wanted.has(tier.wpId) || !tier.isActive) continue
    report.tally('ticket tiers', 'updated')
    if (opts.commit) await prisma.ticketTier.update({ where: { id: tier.id }, data: { isActive: false } })
    report.issue('ticket tier no longer in WordPress, deactivated', `${tier.name} (event ${eventId})`)
  }
}

// ---------------------------------------------------------------- images

/**
 * Fetch each featured image to a local directory with a manifest.
 *
 * basa-app has nowhere to serve uploaded media from yet - no volume, no blob
 * container - so this does not rewrite `Event.image`; it puts the files somewhere
 * safe so that whichever store gets chosen, the images are not still being
 * hotlinked from a WordPress site that is scheduled for deletion (#71).
 */
async function downloadImages(urls: string[], dir: string, report: MigrationReport): Promise<void> {
  mkdirSync(dir, { recursive: true })
  const unique = Array.from(new Set(urls))
  const manifest: Record<string, string> = {}

  for (const url of unique) {
    const name = url.split('/').slice(-1)[0].replace(/[^A-Za-z0-9._-]/g, '_')
    const target = join(dir, name)
    if (existsSync(target)) {
      manifest[url] = name
      report.tally('images', 'unchanged')
      continue
    }
    try {
      const response = await fetch(url)
      if (!response.ok) {
        report.issue(`image fetch returned ${response.status}`, url)
        report.tally('images', 'skipped')
        continue
      }
      const body = Buffer.from(await response.arrayBuffer())
      writeFileSync(target, body)
      manifest[url] = name
      report.tally('images', 'created')
    } catch (err) {
      report.issue('image could not be fetched', `${url}: ${(err as Error).message}`)
      report.tally('images', 'skipped')
    }
  }

  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  report.note(`${Object.keys(manifest).length} images in ${dir}, with manifest.json mapping WordPress URL to file`)
}

// ------------------------------------------------------------------ main

async function main(): Promise<void> {
  const opts = readOptions()
  const report = new MigrationReport('MEC events, venues and organizers (#57)', !opts.commit)

  console.log(`Reading ${opts.dumpPath}`)

  // MEC's materialized occurrence dates, collected in the same pass as everything
  // else. See syncOccurrences for why the times in that table are not used.
  const occurrencesByPost = new Map<number, MecDate[]>()
  const src = await loadWordPress(opts.dumpPath, {
    postTypes: ['mec-events', 'mec_location', 'mec_organizer', 'attachment'],
    options: ['siteurl', 'home', 'timezone_string'],
    extraTables: {
      wp_mec_dates: (row) => {
        const postId = parseInt(row.post_id ?? '', 10)
        if (!Number.isFinite(postId)) return
        const list = occurrencesByPost.get(postId) ?? []
        list.push({ startDate: row.dstart ?? '', endDate: row.dend ?? '' })
        occurrencesByPost.set(postId, list)
      },
    },
  })
  occurrencesByPost.forEach((dates) => dates.sort((a, b) => a.startDate.localeCompare(b.startDate)))
  console.log(
    `  ${(src.postsByType.get('mec-events') ?? []).length} events, ` +
    `${(src.termsByTaxonomy.get('mec_location') ?? []).length} venue terms, ` +
    `${(src.termsByTaxonomy.get('mec_organizer') ?? []).length} organizer terms`
  )

  const venueIds = await importVenues(src, report, opts)
  const organizerIds = await importOrganizers(src, report, opts)
  const images = await importEvents(src, occurrencesByPost, venueIds, organizerIds, report, opts)

  if (opts.imageDir) await downloadImages(images, opts.imageDir, report)
  else report.note(`${new Set(images).size} distinct featured images referenced; pass --images <dir> to fetch them`)

  report.print()

  if (!opts.commit) {
    console.log('Nothing was written. Re-run with --commit to apply.\n')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
