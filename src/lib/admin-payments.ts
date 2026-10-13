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
    member: { businessName: string | null; membershipTier: keyof typeof MEMBERSHIP_TIERS | null } | null
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
  event: { title: string }
  memberRateRequest: { chargedCents: number | null } | null
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

export function paymentToTransaction(p: PaymentRow): Transaction {
  const m = meta(p.metadata)
  const tier = tierLabel(m.tier) ?? tierLabel(m.membershipTier) ?? (p.user.member?.membershipTier ? tierLabel(p.user.member.membershipTier) : null)
  const kind: TransactionKind = m.kind === "membership_renewal" ? "renewal" : m.source === "admin_recorded" ? "recorded" : "membership"
  const title = kind === "renewal" ? "Membership renewal" : kind === "recorded" ? "Membership (recorded by staff)" : "Membership"
  const detail = [tier, p.user.member?.businessName].filter(Boolean).join(" · ") || null
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
    reference: p.stripePaymentIntentId ?? (typeof m.reference === "string" ? m.reference : null),
    at: p.createdAt,
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
  const amountCents = charged != null ? charged : Math.round(Number(r.totalAmount.toString()) * 100)
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
            member: { select: { businessName: true, membershipTier: true } },
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
        paymentIntentId: true, createdAt: true,
        event: { select: { title: true } },
        memberRateRequest: { select: { chargedCents: true } },
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
