import { prisma } from "@/lib/db"
import { loadTransactions } from "@/lib/admin-payments"
import { sendOfficeDigestEmail } from "@/lib/basa-emails"

/**
 * The office's daily digest: one email covering the last day instead of one email
 * per registration or payment.
 *
 * Three rules keep it from becoming clutter:
 *  - It reports the 24 hours up to the moment it runs, so consecutive digests do
 *    not overlap and nothing is mentioned twice.
 *  - A day with nothing new and nothing waiting on the office sends nothing.
 *    Upcoming events and renewals alone do not make a day worth an email.
 *  - Names appear only as far as they help (capped per event); the admin
 *    portal has the full lists and the digest links there.
 */

export const DIGEST_WINDOW_HOURS = 24
/** How far ahead the "coming up" sections look. */
export const DIGEST_LOOKAHEAD_DAYS = 14
/** Names listed per event / per section before the rest are summarized. */
export const DIGEST_NAME_CAP = 10

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

/** Who receives the digest unless OFFICE_DIGEST_TO says otherwise. */
export const DEFAULT_DIGEST_RECIPIENTS = ["jen@businessassociationsa.com"]

export function digestRecipients(raw = process.env.OFFICE_DIGEST_TO): string[] {
  const list = (raw ?? "").split(/[,;\s]+/).map(s => s.trim()).filter(Boolean)
  return list.length ? list : DEFAULT_DIGEST_RECIPIENTS
}

export interface DigestRegistrant {
  name: string
  company: string | null
  tickets: number
  /** Card on hold, waiting for the office to confirm membership. */
  memberRatePending: boolean
}

export interface DigestEventRegistrations {
  eventId: string
  title: string
  startDate: Date
  tickets: number
  registrations: DigestRegistrant[]
}

export interface DigestUpcomingEvent {
  eventId: string
  title: string
  startDate: Date
  confirmedTickets: number
  capacity: number | null
}

export interface DigestPendingRequest {
  id: string
  buyerName: string
  eventTitle: string
  tickets: number
  memberCents: number
  heldCents: number
  deadlineAt: Date | null
}

export interface DigestFailedPayment {
  customerName: string
  title: string
  amountCents: number
  reason: string | null
}

export interface DigestMemberLine {
  name: string
  renewalDate: Date
}

export interface OfficeDigest {
  since: Date
  until: Date
  newRegistrations: DigestEventRegistrations[]
  newRegistrationCount: number
  newTicketCount: number
  pendingRequests: DigestPendingRequest[]
  payments: { completedCount: number; completedCents: number }
  failedPayments: DigestFailedPayment[]
  lapsedMembers: DigestMemberLine[]
  upcomingEvents: DigestUpcomingEvent[]
  renewingSoon: DigestMemberLine[]
}

/** A day is worth an email when something happened or something is waiting on the office. */
export function digestHasNews(d: OfficeDigest): boolean {
  return (
    d.newRegistrationCount > 0 ||
    d.pendingRequests.length > 0 ||
    d.payments.completedCount > 0 ||
    d.failedPayments.length > 0 ||
    d.lapsedMembers.length > 0
  )
}

const memberName = (m: { businessName: string | null; user: { name: string | null; firstName: string | null; lastName: string | null; email: string | null } }) =>
  m.businessName?.trim() ||
  m.user.name?.trim() ||
  [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") ||
  m.user.email ||
  "Unnamed member"

export async function loadOfficeDigest(now: Date = new Date()): Promise<OfficeDigest> {
  const since = new Date(now.getTime() - DIGEST_WINDOW_HOURS * HOUR_MS)
  const horizon = new Date(now.getTime() + DIGEST_LOOKAHEAD_DAYS * DAY_MS)

  const [registrations, requests, transactions, events, lapsed, renewing] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: since, lte: now } },
      orderBy: { createdAt: "asc" },
      select: {
        name: true, company: true, ticketCount: true,
        event: { select: { id: true, title: true, startDate: true } },
        memberRateRequest: { select: { status: true } },
      },
    }),
    prisma.memberRateRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { deadlineAt: "asc" },
      select: {
        id: true, memberCents: true, heldCents: true, deadlineAt: true,
        registration: { select: { name: true, ticketCount: true, event: { select: { title: true } } } },
      },
    }),
    loadTransactions(),
    prisma.event.findMany({
      where: { status: "PUBLISHED", startDate: { gte: now, lte: horizon } },
      orderBy: { startDate: "asc" },
      select: {
        id: true, title: true, startDate: true, capacity: true,
        registrations: { where: { status: "CONFIRMED" }, select: { ticketCount: true } },
      },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "EXPIRED", renewalDate: { gte: since, lt: now } },
      orderBy: { renewalDate: "asc" },
      select: { businessName: true, renewalDate: true, user: { select: { name: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE", renewalDate: { gte: now, lte: horizon } },
      orderBy: { renewalDate: "asc" },
      select: { businessName: true, renewalDate: true, user: { select: { name: true, firstName: true, lastName: true, email: true } } },
    }),
  ])

  const byEvent = new Map<string, DigestEventRegistrations>()
  let newTicketCount = 0
  for (const r of registrations) {
    const group = byEvent.get(r.event.id) ?? {
      eventId: r.event.id, title: r.event.title, startDate: r.event.startDate, tickets: 0, registrations: [],
    }
    group.tickets += r.ticketCount
    group.registrations.push({
      name: r.name, company: r.company, tickets: r.ticketCount,
      memberRatePending: r.memberRateRequest?.status === "PENDING",
    })
    byEvent.set(r.event.id, group)
    newTicketCount += r.ticketCount
  }

  const inWindow = transactions.filter(t => t.at >= since && t.at <= now)
  const completed = inWindow.filter(t => t.status === "COMPLETED")

  return {
    since,
    until: now,
    newRegistrations: Array.from(byEvent.values()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    newRegistrationCount: registrations.length,
    newTicketCount,
    pendingRequests: requests.map(r => ({
      id: r.id,
      buyerName: r.registration.name,
      eventTitle: r.registration.event.title,
      tickets: r.registration.ticketCount,
      memberCents: r.memberCents,
      heldCents: r.heldCents,
      deadlineAt: r.deadlineAt,
    })),
    payments: { completedCount: completed.length, completedCents: completed.reduce((s, t) => s + t.amountCents, 0) },
    failedPayments: inWindow.filter(t => t.status === "FAILED").map(t => ({
      customerName: t.customerName, title: t.title, amountCents: t.amountCents, reason: t.detail,
    })),
    lapsedMembers: lapsed.map(m => ({ name: memberName(m), renewalDate: m.renewalDate! })),
    upcomingEvents: events.map(e => ({
      eventId: e.id,
      title: e.title,
      startDate: e.startDate,
      confirmedTickets: e.registrations.reduce((s, r) => s + r.ticketCount, 0),
      capacity: e.capacity,
    })),
    renewingSoon: renewing.map(m => ({ name: memberName(m), renewalDate: m.renewalDate! })),
  }
}

export interface DigestResult {
  sent: boolean
  /** Why nothing went out, when `sent` is false. */
  reason?: "quiet"
  recipients: string[]
  newRegistrations: number
  pendingRequests: number
}

/**
 * Build today's digest and mail it. `force` sends even on a quiet day (for testing);
 * `to` overrides the recipients so a preview can go to one person.
 */
export async function sendOfficeDigest(opts: { now?: Date; to?: string[]; force?: boolean } = {}): Promise<DigestResult> {
  const digest = await loadOfficeDigest(opts.now)
  const recipients = opts.to?.length ? opts.to : digestRecipients()
  const base = { recipients, newRegistrations: digest.newRegistrationCount, pendingRequests: digest.pendingRequests.length }

  if (!opts.force && !digestHasNews(digest)) return { sent: false, reason: "quiet", ...base }

  // One failed recipient must not stop the others getting it.
  const results = await Promise.allSettled(recipients.map(to => sendOfficeDigestEmail(to, digest)))
  const failed = results.filter(r => r.status === "rejected")
  if (failed.length === results.length) throw (failed[0] as PromiseRejectedResult).reason
  return { sent: true, ...base }
}
