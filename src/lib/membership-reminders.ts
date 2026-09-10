import { prisma } from "@/lib/db"
import * as Sentry from "@sentry/nextjs"
import { sendMembershipExpiredEmail, sendMembershipRenewalReminderEmail } from "@/lib/basa-emails"

const { logger } = Sentry

/**
 * How far ahead of renewal a member is warned, longest first (#82).
 *
 * Confirm with BASA before treating these as final; they are a sensible default,
 * not a decision anyone made.
 */
export const REMINDER_INTERVALS = [30, 7, 1] as const

/** `daysBefore` recorded for the notice sent once a membership has lapsed. */
export const EXPIRED_NOTICE = 0

/**
 * How long after lapsing a member can still be told about it.
 *
 * This bound is load-bearing rather than tidy. The PMPro import (#58) brought in
 * 135 members who are already EXPIRED with renewal dates going back years; without
 * a window, the first run of this sweep would email every one of them about a
 * membership they let go in 2022. Three days covers a couple of missed runs and
 * nothing more.
 */
export const EXPIRED_NOTICE_WINDOW_DAYS = 3

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The renewal cycle a notice belongs to, as a date rather than an instant.
 *
 * `renewalDate` carries a time: it is set to the payment instant plus a year. If
 * the raw value were the cycle key, anything that rewrote it by even a
 * millisecond - a re-save that recomputes the term, a backfill - would look like
 * a new cycle and send the whole set again. Truncating to UTC midnight means the
 * key is the day the membership ends, which is what a member would call the
 * cycle anyway.
 *
 * The trade is that two genuinely different cycles landing on the same UTC date
 * would share a key. That needs two renewals within a year hitting the same day,
 * and suppressing a duplicate email is the safer way to be wrong.
 */
export function reminderCycle(renewalDate: Date): Date {
  return new Date(Date.UTC(
    renewalDate.getUTCFullYear(), renewalDate.getUTCMonth(), renewalDate.getUTCDate()
  ))
}

/** Whole days from `now` until `renewalDate`; negative once it has passed. */
export function daysUntil(renewalDate: Date, now: Date): number {
  return Math.ceil((renewalDate.getTime() - now.getTime()) / DAY_MS)
}

/**
 * Which interval a member is due for, or null.
 *
 * Bucketed rather than matched on an exact day, so a sweep that did not run for a
 * few days still sends the notice that is still true. A member 25 days out falls
 * in the 30-day bucket; one 3 days out falls in the 7-day bucket and does not also
 * collect the 30-day notice they never received. The email quotes the real number
 * of days remaining, not the bucket.
 */
export function dueInterval(renewalDate: Date, now: Date): number | null {
  const remaining = daysUntil(renewalDate, now)
  if (remaining < 0) return null

  // Starts below zero so the smallest bucket includes renewal day itself: a
  // membership ending today has 0 days remaining and still needs telling.
  let smaller = -1
  for (const interval of [...REMINDER_INTERVALS].sort((a, b) => a - b)) {
    if (remaining > smaller && remaining <= interval) return interval
    smaller = interval
  }
  return null
}

export interface ReminderSweepResult {
  remindersSent: number
  expiredNoticesSent: number
  /** Rows another worker had already written; not an error, and not re-sent. */
  alreadySent: number
  failed: number
  /** Members with no renewalDate, who can never be reminded. */
  missingRenewalDate: number
}

interface Candidate {
  memberId: string
  email: string
  firstName: string
  /** The real date, which is what the member is told. */
  renewalDate: Date
  /** The cycle key, truncated to a day. See reminderCycle. */
  cycle: Date
  daysBefore: number
  remaining: number
}

/**
 * Send the renewal notices that are due, exactly once each.
 *
 * The claim to send is made by inserting into MembershipReminder *before* the
 * email goes out. That way a crash between the two loses a notice rather than
 * repeating it every day until someone notices, and two workers racing cannot both
 * send: the second one's insert violates the unique constraint.
 */
export async function sendDueRenewalNotices(now: Date = new Date()): Promise<ReminderSweepResult> {
  const result: ReminderSweepResult = {
    remindersSent: 0, expiredNoticesSent: 0, alreadySent: 0, failed: 0, missingRenewalDate: 0,
  }

  const horizon = new Date(now.getTime() + Math.max(...REMINDER_INTERVALS) * DAY_MS)
  const lapsedSince = new Date(now.getTime() - EXPIRED_NOTICE_WINDOW_DAYS * DAY_MS)

  const [upcoming, lapsed, missingRenewalDate] = await Promise.all([
    prisma.member.findMany({
      where: {
        membershipStatus: "ACTIVE",
        renewalDate: { not: null, gte: now, lte: horizon },
      },
      select: { id: true, renewalDate: true, user: { select: { email: true, firstName: true, name: true } } },
    }),
    prisma.member.findMany({
      where: {
        membershipStatus: "EXPIRED",
        // The window, not just "in the past": see EXPIRED_NOTICE_WINDOW_DAYS.
        renewalDate: { not: null, gte: lapsedSince, lt: now },
      },
      select: { id: true, renewalDate: true, user: { select: { email: true, firstName: true, name: true } } },
    }),
    prisma.member.count({ where: { membershipStatus: "ACTIVE", renewalDate: null } }),
  ])

  result.missingRenewalDate = missingRenewalDate

  const candidates: Candidate[] = []

  for (const member of upcoming) {
    const renewalDate = member.renewalDate!
    const interval = dueInterval(renewalDate, now)
    if (interval === null) continue
    const email = member.user.email
    if (!email) continue
    candidates.push({
      memberId: member.id,
      email,
      renewalDate,
      cycle: reminderCycle(renewalDate),
      firstName: member.user.firstName ?? member.user.name ?? "there",
      daysBefore: interval,
      remaining: daysUntil(renewalDate, now),
    })
  }

  for (const member of lapsed) {
    const email = member.user.email
    if (!email) continue
    candidates.push({
      memberId: member.id,
      email,
      renewalDate: member.renewalDate!,
      cycle: reminderCycle(member.renewalDate!),
      firstName: member.user.firstName ?? member.user.name ?? "there",
      daysBefore: EXPIRED_NOTICE,
      remaining: daysUntil(member.renewalDate!, now),
    })
  }

  for (const candidate of candidates) {
    // Claim first. A duplicate key here means someone else has this one.
    try {
      await prisma.membershipReminder.create({
        data: {
          memberId: candidate.memberId,
          renewalDate: candidate.cycle,
          daysBefore: candidate.daysBefore,
        },
      })
    } catch {
      result.alreadySent++
      continue
    }

    const sent = candidate.daysBefore === EXPIRED_NOTICE
      ? await sendMembershipExpiredEmail(candidate.email, candidate.firstName, candidate.renewalDate)
      : await sendMembershipRenewalReminderEmail(
          candidate.email, candidate.firstName, candidate.renewalDate, candidate.remaining
        )

    if (sent.success) {
      if (candidate.daysBefore === EXPIRED_NOTICE) result.expiredNoticesSent++
      else result.remindersSent++
      continue
    }

    result.failed++
    // The claim stays. Re-sending on tomorrow's run would mean a member who is
    // already receiving mail gets it twice as often as anyone else, and a broken
    // Mailgun key would turn into a repeating flood rather than one bad day.
    logger.error(
      logger.fmt`Renewal notice failed for member ${candidate.memberId} (${candidate.daysBefore} days): ${sent.error}`
    )
  }

  return result
}
