import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { EVENT_TIME_ZONE } from "@/lib/event-time"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers"

/**
 * The admin Payment Management page and its CSV export. They used to render a
 * fixed mock-up. Real money is recorded in three places, merged here:
 *  - `Payment` rows: online memberships, renewals, and payments an admin recorded;
 *  - `EventRegistration` rows with a Stripe payment: ticket sales (no Payment row);
 *  - `MEMBERSHIP_PAYMENT_FAILED` audit entries: declined membership charges.
 * Refunds count Payment rows and registrations marked REFUNDED; a refund made
 * only in the Stripe dashboard is not recorded in the database.
 */

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED"
export type TransactionKind = "membership" | "renewal" | "recorded" | "tickets" | "failed"

/** What a transaction was for, shown when a row is opened. */
export interface TransactionBreakdown {
  /** What was bought: one line per ticket tier, or the membership level. */
  lines: Array<{ label: string; note: string | null; quantity: number | null; amountCents: number | null }>
  facts: Array<{ label: string; value: string }>
  links: Array<{ label: string; href: string }>
}

export interface Transaction {
  id: string
  kind: TransactionKind
  title: string
  detail: string | null
  customerName: string
  customerEmail: string
  amountCents: number
  status: TransactionStatus
  method: string
  /** Stripe id when there is one (payment intent), for matching against Stripe. */
  reference: string | null
  at: Date
  breakdown: TransactionBreakdown
}

export const STATUS_LABEL: Record<TransactionStatus, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Card",
  CASH: "Cash",
  CHECK: "Check",
  BANK_TRANSFER: "Bank transfer",
  PAYPAL: "PayPal",
}

// --- Row shapes the loader selects (also what the tests feed in) -------------

export interface PaymentRow {
  id: string
  amount: number
  status: PaymentStatus
  paymentMethod: PaymentMethod
  stripePaymentIntentId: string | null
  metadata: Prisma.JsonValue
  createdAt: Date
  user: {
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    member: {
      businessName: string | null
      membershipTier: keyof typeof MEMBERSHIP_TIERS | null
      membershipStatus: string
      renewalDate: Date | null
    } | null
  }
}

export interface RegistrationRow {
  id: string
  name: string
  email: string
  company: string | null
  ticketCount: number
  totalAmount: { toString(): string } | number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED"
  paymentIntentId: string | null
  createdAt: Date
  checkedInAt: Date | null
  /** Per-ticket attendee details, [{ name, email? }]. */
  attendees: Prisma.JsonValue
  event: { title: string; slug: string; startDate: Date }
  items: Array<{
    quantity: number
    unitPrice: { toString(): string } | number
    ticketTier: { name: string }
  }>
  memberRateRequest: { status: string; heldCents: number; memberCents: number; chargedCents: number | null } | null
}

export interface FailureRow {
  id: string
  entityId: string | null
  timestamp: Date
  newValues: Prisma.JsonValue
  user: { name: string | null; firstName: string | null; lastName: string | null; email: string | null } | null
}

// --- Pure mapping -------------------------------------------------------------

function personName(u: { name: string | null; firstName: string | null; lastName: string | null; email: string | null }): string {
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim()
  return full || u.name || u.email || "Unknown"
}

function meta(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function tierLabel(value: unknown): string | null {
  return typeof value === "string" && value in MEMBERSHIP_TIERS
    ? MEMBERSHIP_TIERS[value as keyof typeof MEMBERSHIP_TIERS].label
    : null
}

const num = (v: { toString(): string } | number) => Number(v.toString())
const cents = (v: { toString(): string } | number) => Math.round(num(v) * 100)
const dollars = (c: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100)
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: EVENT_TIME_ZONE }).format(d)
const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: EVENT_TIME_ZONE }).format(d)
const sentence = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ")

/** Stripe dashboard link for a payment intent id; anything else (a check number) has none. */
const stripeLinks = (ref: string | null): TransactionBreakdown["links"] =>
  ref && /^pi_[A-Za-z0-9]+$/.test(ref) ? [{ label: "View in Stripe", href: `https://dashboard.stripe.com/payments/${ref}` }] : []

function attendeeNames(value: Prisma.JsonValue): string | null {
  if (!Array.isArray(value)) return null
  const names = value
    .map(a => (a && typeof a === "object" && !Array.isArray(a) && typeof (a as Record<string, unknown>).name === "string" ? ((a as Record<string, unknown>).name as string).trim() : ""))
    .filter(Boolean)
  return names.length ? names.join(", ") : null
}

export function paymentToTransaction(p: PaymentRow): Transaction {
  const m = meta(p.metadata)
  const tier = tierLabel(m.tier) ?? tierLabel(m.membershipTier) ?? (p.user.member?.membershipTier ? tierLabel(p.user.member.membershipTier) : null)
  const kind: TransactionKind = m.kind === "membership_renewal" ? "renewal" : m.source === "admin_recorded" ? "recorded" : "membership"
  const title = kind === "renewal" ? "Membership renewal" : kind === "recorded" ? "Membership (recorded by staff)" : "Membership"
  const detail = [tier, p.user.member?.businessName].filter(Boolean).join(" · ") || null
  const reference = p.stripePaymentIntentId ?? (typeof m.reference === "string" ? m.reference : null)
  const online = typeof m.subscriptionId === "string" && m.subscriptionId !== ""
  const member = p.user.member
  const facts: TransactionBreakdown["facts"] = []
  if (member?.businessName) facts.push({ label: "Business", value: member.businessName })
  if (member) facts.push({ label: "Membership now", value: sentence(member.membershipStatus) })
  if (member?.renewalDate) facts.push({ label: "Renews / expires", value: fmtDate(member.renewalDate) })
  facts.push({ label: "Billing", value: online ? "Online subscription, renews automatically" : kind === "recorded" ? "Payment recorded by staff" : "Billed by the office" })
  facts.push({ label: "Paid by", value: METHOD_LABEL[p.paymentMethod] })
  if (typeof m.reference === "string" && !p.stripePaymentIntentId) facts.push({ label: "Reference", value: m.reference })
  const breakdown: TransactionBreakdown = {
    lines: [{
      label: tier ?? "Membership",
      note: kind === "renewal" ? "Yearly renewal" : "Yearly membership",
      quantity: 1,
      amountCents: p.amount,
    }],
    facts,
    links: stripeLinks(reference),
  }
  return {
    id: `pay_${p.id}`,
    kind,
    title,
    detail,
    customerName: personName(p.user),
    customerEmail: p.user.email ?? "",
    amountCents: p.amount,
    status: p.status,
    method: METHOD_LABEL[p.paymentMethod],
    reference,
    at: p.createdAt,
    breakdown,
  }
}

const REGISTRATION_STATUS: Record<RegistrationRow["status"], TransactionStatus> = {
  CONFIRMED: "COMPLETED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
}

export function registrationToTransaction(r: RegistrationRow): Transaction {
  // A member-rate hold is captured for less (or the same) once an admin decides;
  // chargedCents is what the card was actually charged.
  const charged = r.memberRateRequest?.chargedCents
  const amountCents = charged != null ? charged : cents(r.totalAmount)
  const lines: TransactionBreakdown["lines"] = r.items.length
    ? r.items.map(i => ({
        label: i.ticketTier.name,
        note: `${dollars(cents(i.unitPrice))} each`,
        quantity: i.quantity,
        amountCents: cents(i.unitPrice) * i.quantity,
      }))
    : [{ label: "Tickets", note: null, quantity: r.ticketCount, amountCents: cents(r.totalAmount) }]
  const facts: TransactionBreakdown["facts"] = [{ label: "Event date", value: fmtDateTime(r.event.startDate) }]
  if (r.company) facts.push({ label: "Company", value: r.company })
  const names = attendeeNames(r.attendees)
  if (names) facts.push({ label: "Attendees", value: names })
  const req = r.memberRateRequest
  if (req) {
    facts.push({
      label: "Member rate",
      value: `${sentence(req.status)}. Card held for ${dollars(req.heldCents)}; member total ${dollars(req.memberCents)}${req.chargedCents != null ? `; charged ${dollars(req.chargedCents)}` : ""}`,
    })
  }
  if (r.checkedInAt) facts.push({ label: "Checked in", value: fmtDateTime(r.checkedInAt) })
  const breakdown: TransactionBreakdown = {
    lines,
    facts,
    links: [{ label: "View event page", href: `/events/${r.event.slug}` }, ...stripeLinks(r.paymentIntentId)],
  }
  return {
    id: `reg_${r.id}`,
    kind: "tickets",
    title: r.event.title,
    detail: `${r.ticketCount} ticket${r.ticketCount === 1 ? "" : "s"}${r.company ? ` · ${r.company}` : ""}`,
    customerName: r.name,
    customerEmail: r.email,
    amountCents,
    status: REGISTRATION_STATUS[r.status],
    method: "Card",
    reference: r.paymentIntentId,
    at: r.createdAt,
    breakdown,
  }
}

export function failureToTransaction(f: FailureRow): Transaction {
  const v = meta(f.newValues)
  const reason = typeof v.lastPaymentError === "string" ? v.lastPaymentError : null
  return {
    id: `fail_${f.id}`,
    kind: "failed",
    title: "Membership payment",
    detail: reason,
    customerName: f.user ? personName(f.user) : "Unknown",
    customerEmail: f.user?.email ?? "",
    amountCents: typeof v.amount === "number" ? v.amount : 0,
    status: "FAILED",
    method: "Card",
    reference: f.entityId,
    at: f.timestamp,
    breakdown: {
      lines: [{ label: "Membership payment", note: reason, quantity: 1, amountCents: typeof v.amount === "number" ? v.amount : null }],
      facts: reason ? [{ label: "Decline reason", value: reason }] : [],
      links: stripeLinks(f.entityId),
    },
  }
}

export function sortNewestFirst(rows: Transaction[]): Transaction[] {
  return [...rows].sort((a, b) => b.at.getTime() - a.at.getTime())
}

// --- Summary ------------------------------------------------------------------

export interface PaymentSummary {
  revenueCents: number
  completedCount: number
  thisMonthCents: number
  lastMonthCents: number
  pendingCents: number
  pendingCount: number
  failedCents: number
  failedCount: number
  refundedCents: number
  refundedCount: number
}

const monthKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: EVENT_TIME_ZONE }).format(d)

export function summarize(rows: Transaction[], now: Date = new Date()): PaymentSummary {
  const thisKey = monthKey(now)
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 15))
  const s: PaymentSummary = {
    revenueCents: 0, completedCount: 0, thisMonthCents: 0, lastMonthCents: 0,
    pendingCents: 0, pendingCount: 0, failedCents: 0, failedCount: 0, refundedCents: 0, refundedCount: 0,
  }
  for (const r of rows) {
    if (r.status === "COMPLETED") {
      s.revenueCents += r.amountCents
      s.completedCount += 1
      const k = monthKey(r.at)
      if (k === thisKey) s.thisMonthCents += r.amountCents
      else if (k === lastKey) s.lastMonthCents += r.amountCents
    } else if (r.status === "PENDING") {
      s.pendingCents += r.amountCents
      s.pendingCount += 1
    } else if (r.status === "FAILED") {
      s.failedCents += r.amountCents
      s.failedCount += 1
    } else if (r.status === "REFUNDED") {
      s.refundedCents += r.amountCents
      s.refundedCount += 1
    }
  }
  return s
}

// --- Filtering ----------------------------------------------------------------

export const PAGE_SIZE = 25

export function filterTransactions(rows: Transaction[], opts: { q?: string; status?: string }): Transaction[] {
  const q = opts.q?.trim().toLowerCase()
  const status = opts.status && opts.status in STATUS_LABEL ? (opts.status as TransactionStatus) : null
  return rows.filter(r => {
    if (status && r.status !== status) return false
    if (!q) return true
    return [r.customerName, r.customerEmail, r.title, r.detail, r.reference]
      .some(v => v?.toLowerCase().includes(q))
  })
}

// --- Loader -------------------------------------------------------------------

/** Newest-first merge of every recorded payment. Bounded: a few hundred rows a year. */
export async function loadTransactions(): Promise<Transaction[]> {
  const [payments, registrations, failures] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true, amount: true, status: true, paymentMethod: true, stripePaymentIntentId: true, metadata: true, createdAt: true,
        user: {
          select: {
            name: true, firstName: true, lastName: true, email: true,
            member: { select: { businessName: true, membershipTier: true, membershipStatus: true, renewalDate: true } },
          },
        },
      },
    }),
    prisma.eventRegistration.findMany({
      where: { paymentIntentId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true, name: true, email: true, company: true, ticketCount: true, totalAmount: true, status: true,
        paymentIntentId: true, createdAt: true, checkedInAt: true, attendees: true,
        event: { select: { title: true, slug: true, startDate: true } },
        items: { select: { quantity: true, unitPrice: true, ticketTier: { select: { name: true } } } },
        memberRateRequest: { select: { status: true, heldCents: true, memberCents: true, chargedCents: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: { action: "MEMBERSHIP_PAYMENT_FAILED" },
      orderBy: { timestamp: "desc" },
      take: 500,
      select: {
        id: true, entityId: true, timestamp: true, newValues: true,
        user: { select: { name: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ])
  return sortNewestFirst([
    ...payments.map(paymentToTransaction),
    ...registrations.map(registrationToTransaction),
    ...failures.map(failureToTransaction),
  ])
}
