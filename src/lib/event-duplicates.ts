/**
 * Duplicate detection for events created by hand or from flyers.
 *
 * The rule that matters: a flyer is only a duplicate if the DATE matches too.
 * "Brewing with BASA" runs on many dates with the same flyer, and each date is its
 * own event. So:
 *   - same day and (near-)same title                     -> `exact`
 *   - same day and an overlapping title, or same venue   -> `likely`
 *     (a re-issued flyer usually shortens or rewords the title)
 *   - same title on other days                           -> reported separately,
 *     never blocking, so the admin can see the dates were checked.
 */
import { EVENT_TIME_ZONE } from "@/lib/event-time"

export interface ExistingEvent {
  id: string
  title: string
  slug: string
  startDate: Date | string
  location: string
  status: string
}

export interface Candidate {
  title: string
  startDate: Date
  location?: string
}

export type DuplicateLevel = "exact" | "likely"

export interface DuplicateMatch {
  id: string
  title: string
  slug: string
  startDate: string
  location: string
  status: string
  level: DuplicateLevel
}

export interface DuplicateReport {
  /** Same-day matches, strongest first. Non-empty means creating would likely duplicate. */
  matches: DuplicateMatch[]
  /** Same title on other days: fine to create, shown so the dates are visibly checked. */
  otherDates: Array<{ id: string; title: string; startDate: string }>
}

const STOP = new Set(["the", "a", "an", "of", "with", "at", "and", "for", "to", "in", "on", "basa", "our", "join", "us"])

export function titleTokens(title: string): string[] {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t) && !/^(19|20)\d\d$/.test(t))
}

function overlap(a: string[], b: string[]): { jaccard: number; contained: number } {
  const A = new Set(a)
  const B = new Set(b)
  if (A.size === 0 || B.size === 0) return { jaccard: 0, contained: 0 }
  let shared = 0
  A.forEach((t) => { if (B.has(t)) shared++ })
  const smaller = Math.min(A.size, B.size)
  return {
    jaccard: shared / (A.size + B.size - shared),
    // A one-word title ("Mixer") contains-matches too easily; require two tokens.
    contained: smaller >= 2 ? shared / smaller : shared === smaller && A.size === B.size ? 1 : 0,
  }
}

const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIME_ZONE })
/** Calendar day in the association's timezone, so 9 pm Central is not "tomorrow" in UTC. */
export function eventDay(d: Date | string): string {
  return dayFmt.format(typeof d === "string" ? new Date(d) : d)
}

const norm = (s: string) => titleTokens(s).join(" ")

export function findDuplicates(candidate: Candidate, existing: ExistingEvent[], opts: { excludeId?: string } = {}): DuplicateReport {
  const day = eventDay(candidate.startDate)
  const tokens = titleTokens(candidate.title)
  const venue = candidate.location ? norm(candidate.location) : ""

  const matches: DuplicateMatch[] = []
  const otherDates: DuplicateReport["otherDates"] = []

  for (const e of existing) {
    if (e.id === opts.excludeId) continue
    const sim = overlap(tokens, titleTokens(e.title))
    const sameDay = eventDay(e.startDate) === day
    const startIso = new Date(e.startDate).toISOString()

    if (sameDay) {
      let level: DuplicateLevel | null = null
      if (sim.jaccard >= 0.8) level = "exact"
      else if (sim.contained >= 0.8 || sim.jaccard >= 0.5) level = "likely"
      else if (venue && norm(e.location) === venue && sim.jaccard >= 0.25) level = "likely"
      if (level) {
        matches.push({ id: e.id, title: e.title, slug: e.slug, startDate: startIso, location: e.location, status: e.status, level })
      }
    } else if (sim.jaccard >= 0.8) {
      otherDates.push({ id: e.id, title: e.title, startDate: startIso })
    }
  }

  matches.sort((a, b) => Number(b.level === "exact") - Number(a.level === "exact"))
  otherDates.sort((a, b) => a.startDate.localeCompare(b.startDate))
  return { matches, otherDates }
}
