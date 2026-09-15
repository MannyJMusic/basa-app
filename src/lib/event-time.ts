/**
 * Event times as the admin form and the API exchange them.
 *
 * The admin form uses <input type="datetime-local">, whose value is a naive wall
 * clock like "2026-10-13T17:30". Events happen in San Antonio, so a naive value is
 * read as America/Chicago wall clock (the same convention the WordPress importer
 * uses) and stored as the UTC instant it names. A value with an explicit zone
 * ("…Z" or "…-05:00") is taken as given.
 */
export const EVENT_TIME_ZONE = 'America/Chicago'

const NAIVE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

function zoneOffsetMs(instant: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(instant)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  // Intl reports midnight as "24" with hour12: false in some engines.
  const hour = get('hour') % 24
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
  return asUtc - instant.getTime()
}

/** A wall clock in `zone` to the UTC instant it names, correct across DST changes. */
export function wallClockToUtc(
  year: number, month: number, day: number, hour: number, minute: number, second = 0, zone = EVENT_TIME_ZONE,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, second)
  const firstGuess = naive - zoneOffsetMs(new Date(naive), zone)
  const corrected = naive - zoneOffsetMs(new Date(firstGuess), zone)
  return new Date(corrected)
}

/**
 * Parse what a client sends for startDate/endDate. Returns null for anything
 * that is not a real date, so the caller can answer 400 with a useful message.
 */
export function parseEventDateTime(value: string): Date | null {
  const m = NAIVE.exec(value.trim())
  if (m) {
    const [, y, mo, d, h, mi, s] = m
    const date = wallClockToUtc(+y, +mo, +d, +h, +mi, s ? +s : 0)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
