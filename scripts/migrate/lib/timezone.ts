/**
 * MEC stores an event's date and time as local wall clock - "2026-10-13", hour
 * "4", minutes "30", ampm "PM" - with no offset anywhere in the row.
 *
 * `Event.startDate` is a Prisma `DateTime`, which lands in Postgres as
 * `timestamp without time zone` and is read back as UTC. The event pages format
 * in `America/Chicago`. So a wall clock written straight through renders five or
 * six hours early, and the error changes across the DST boundary (verified on
 * production while fixing #85: a stored 18:00 rendered as 1:00 PM).
 *
 * Note the WordPress site's own `timezone_string` is `America/Mexico_City`,
 * which is not San Antonio: Mexico City stopped observing DST in 2022, so for
 * most of the year it is an hour behind Central. The times in these events were
 * written by people in San Antonio meaning San Antonio time, so the importer
 * treats them as `America/Chicago` and ignores the site setting.
 */
export const EVENT_TIME_ZONE = 'America/Chicago'

interface DateParts { type: string; value: string }

/** How far ahead of UTC `zone` is at this instant, in milliseconds. */
function zoneOffsetMs(instant: Date, zone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  // formatToParts is ES2017; this project's tsconfig targets an older lib.
  const parts = (formatter as unknown as { formatToParts(d: Date): DateParts[] })
    .formatToParts(instant) as unknown as DateParts[]

  const get = (type: string): number => {
    const part = parts.filter((p) => p.type === type)[0]
    return part ? parseInt(part.value, 10) : 0
  }
  // hour12:false yields 24 for midnight in some ICU versions.
  const hour = get('hour') % 24
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
  return asUtc - instant.getTime()
}

/**
 * Turn a local wall clock in `zone` into the UTC instant it names.
 *
 * Two passes: the first guesses using the offset at the naively-interpreted
 * time, the second corrects it if that guess landed on the other side of a DST
 * change. Times inside the spring-forward gap resolve to the hour after it,
 * which is what a calendar does with an impossible time.
 */
export function wallClockToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number,
  zone: string = EVENT_TIME_ZONE
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0)
  const firstGuess = naive - zoneOffsetMs(new Date(naive), zone)
  const corrected = naive - zoneOffsetMs(new Date(firstGuess), zone)
  return new Date(corrected)
}

/** "4" + "30" + "PM" as MEC writes them, to 24-hour numbers. */
export function to24Hour(hour: string, minutes: string, ampm: string): { hour: number; minute: number } | null {
  const h = parseInt(hour, 10)
  const m = parseInt(minutes, 10)
  if (!Number.isFinite(h) || h < 1 || h > 12) return null
  const minute = Number.isFinite(m) ? m : 0
  if (minute < 0 || minute > 59) return null

  const meridiem = ampm.trim().toUpperCase()
  if (meridiem !== 'AM' && meridiem !== 'PM') return null
  const base = h % 12
  return { hour: meridiem === 'PM' ? base + 12 : base, minute }
}

/** Renders an instant back in the event time zone, for reports and dry runs. */
export function formatInEventZone(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric', month: 'short', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date)
}
