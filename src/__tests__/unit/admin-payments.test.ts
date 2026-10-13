/** @jest-environment node */
import {
  failureToTransaction,
  filterTransactions,
  paymentToTransaction,
  registrationToTransaction,
  sortNewestFirst,
  summarize,
  type PaymentRow,
  type RegistrationRow,
  type Transaction,
} from "@/lib/admin-payments"

jest.mock("@/lib/db", () => ({ prisma: {} }))

const user = {
  name: null, firstName: "Larry", lastName: "Silva", email: "larry@example.com",
  member: { businessName: "Heineken USA", membershipTier: "MIXER_MEMBER" as const },
}
const payment = (over: Partial<PaymentRow> = {}): PaymentRow => ({
  id: "p1", amount: 199000, status: "COMPLETED", paymentMethod: "CREDIT_CARD",
  stripePaymentIntentId: "pi_123", metadata: { kind: "membership", tier: "MIXER_MEMBER" },
  createdAt: new Date("2026-10-03T01:00:00Z"), user, ...over,
})
const registration = (over: Partial<RegistrationRow> = {}): RegistrationRow => ({
  id: "r1", name: "Pat Buyer", email: "pat@example.com", company: "Acme", ticketCount: 2,
  totalAmount: "35.00", status: "CONFIRMED", paymentIntentId: "pi_456",
  createdAt: new Date("2026-10-01T15:00:00Z"), event: { title: "Taco Tuesday" }, memberRateRequest: null, ...over,
})

describe("paymentToTransaction", () => {
  it("labels a new membership with its tier and business", () => {
    const t = paymentToTransaction(payment())
    expect(t).toMatchObject({ kind: "membership", title: "Membership", amountCents: 199000, status: "COMPLETED", method: "Card", reference: "pi_123", customerName: "Larry Silva" })
    expect(t.detail).toBe("Mixer Member · Heineken USA")
  })
  it("tells renewals and staff-recorded payments apart", () => {
    expect(paymentToTransaction(payment({ metadata: { kind: "membership_renewal" } })).title).toBe("Membership renewal")
    const rec = paymentToTransaction(payment({ paymentMethod: "CHECK", stripePaymentIntentId: null, metadata: { source: "admin_recorded", reference: "chk 1042" } }))
    expect(rec).toMatchObject({ kind: "recorded", method: "Check", reference: "chk 1042" })
  })
  it("survives missing metadata", () => {
    expect(paymentToTransaction(payment({ metadata: null })).kind).toBe("membership")
  })
})

describe("registrationToTransaction", () => {
  it("shows a refunded registration as a refund", () => {
    expect(registrationToTransaction(registration({ status: "REFUNDED" })).status).toBe("REFUNDED")
  })
  it("converts dollars to cents and maps status", () => {
    expect(registrationToTransaction(registration())).toMatchObject({ amountCents: 3500, status: "COMPLETED", title: "Taco Tuesday", detail: "2 tickets · Acme" })
    expect(registrationToTransaction(registration({ status: "PENDING" })).status).toBe("PENDING")
    expect(registrationToTransaction(registration({ status: "CANCELLED", ticketCount: 1, company: null })).detail).toBe("1 ticket")
  })
  it("uses what a member-rate hold was actually charged", () => {
    expect(registrationToTransaction(registration({ memberRateRequest: { chargedCents: 2500 } })).amountCents).toBe(2500)
  })
})

describe("failureToTransaction", () => {
  it("reads the amount and decline reason", () => {
    const t = failureToTransaction({ id: "a1", entityId: "pi_9", timestamp: new Date(), newValues: { amount: 35000, lastPaymentError: "Card declined" }, user: { name: null, firstName: null, lastName: null, email: "x@example.com" } })
    expect(t).toMatchObject({ status: "FAILED", amountCents: 35000, detail: "Card declined", customerName: "x@example.com" })
  })
})

describe("summarize", () => {
  const now = new Date("2026-10-15T12:00:00Z")
  const mk = (status: Transaction["status"], amountCents: number, at: string): Transaction => ({
    id: at + status, kind: "tickets", title: "t", detail: null, customerName: "n", customerEmail: "e", amountCents, status, method: "Card", reference: null, at: new Date(at),
  })
  it("totals by status and compares this month with last", () => {
    const s = summarize([
      mk("COMPLETED", 10000, "2026-10-02T18:00:00Z"),
      mk("COMPLETED", 5000, "2026-09-20T18:00:00Z"),
      mk("COMPLETED", 700, "2026-07-01T18:00:00Z"),
      mk("PENDING", 300, "2026-10-10T18:00:00Z"),
      mk("FAILED", 200, "2026-10-11T18:00:00Z"),
      mk("REFUNDED", 100, "2026-10-12T18:00:00Z"),
      mk("CANCELLED", 999, "2026-10-12T18:00:00Z"),
    ], now)
    expect(s).toMatchObject({ revenueCents: 15700, completedCount: 3, thisMonthCents: 10000, lastMonthCents: 5000, pendingCents: 300, pendingCount: 1, failedCents: 200, failedCount: 1, refundedCents: 100, refundedCount: 1 })
  })
  it("counts a payment made late on the 30th Chicago time in that month", () => {
    // 2026-09-30 23:30 CDT is already 2026-10-01 UTC.
    const s = summarize([mk("COMPLETED", 100, "2026-10-01T04:30:00Z")], now)
    expect(s.lastMonthCents).toBe(100)
    expect(s.thisMonthCents).toBe(0)
  })
  it("is all zeros with no data", () => {
    expect(summarize([], now).revenueCents).toBe(0)
  })
})

describe("filterTransactions and sorting", () => {
  const rows = sortNewestFirst([
    paymentToTransaction(payment()),
    registrationToTransaction(registration()),
    registrationToTransaction(registration({ id: "r2", status: "PENDING", name: "Dana", email: "dana@example.com", paymentIntentId: "pi_789", createdAt: new Date("2026-10-05T00:00:00Z") })),
  ])
  it("sorts newest first", () => {
    expect(rows.map(r => r.id)).toEqual(["reg_r2", "pay_p1", "reg_r1"])
    expect(rows[0].at.getTime()).toBeGreaterThan(rows[2].at.getTime())
  })
  it("searches name, email, title and Stripe id, case-insensitively", () => {
    expect(filterTransactions(rows, { q: "TACO" })).toHaveLength(2)
    expect(filterTransactions(rows, { q: "dana@" })).toHaveLength(1)
    expect(filterTransactions(rows, { q: "pi_123" })).toHaveLength(1)
    expect(filterTransactions(rows, { q: "nobody" })).toHaveLength(0)
  })
  it("filters by status and ignores an unknown one", () => {
    expect(filterTransactions(rows, { status: "PENDING" })).toHaveLength(1)
    expect(filterTransactions(rows, { status: "bogus" })).toHaveLength(3)
  })
})
