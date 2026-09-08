import {
  GRACE_PERIOD_DAYS,
  gracePeriodEnd,
  isPastGracePeriod,
  membershipTermEnd,
  renewalDateForPayment,
} from "@/lib/membership-lifecycle"

describe("membershipTermEnd", () => {
  it("adds a year", () => {
    expect(membershipTermEnd(new Date("2026-03-10T12:00:00Z")).toISOString())
      .toBe(new Date("2027-03-10T12:00:00Z").toISOString())
  })

  it("does not mutate its argument", () => {
    const from = new Date("2026-03-10T12:00:00Z")
    membershipTermEnd(from)
    expect(from.toISOString()).toBe("2026-03-10T12:00:00.000Z")
  })

  it("is stable across a DST boundary, unlike local-time arithmetic", () => {
    // 2026-03-10 and 2027-03-10 sit on opposite sides of a US DST change.
    expect(membershipTermEnd(new Date("2026-03-10T12:00:00Z")).toISOString())
      .toBe("2027-03-10T12:00:00.000Z")
  })

  it("handles a leap day without landing on an invalid date", () => {
    const end = membershipTermEnd(new Date("2028-02-29T00:00:00Z"))
    expect(Number.isNaN(end.getTime())).toBe(false)
    expect(end.getUTCFullYear()).toBe(2029)
  })
})

describe("gracePeriodEnd", () => {
  it("adds the grace period to the renewal date", () => {
    const renewal = new Date("2026-01-01T00:00:00Z")
    const expected = new Date(renewal)
    expected.setUTCDate(expected.getUTCDate() + GRACE_PERIOD_DAYS)
    expect(gracePeriodEnd(renewal).toISOString()).toBe(expected.toISOString())
  })
})

describe("isPastGracePeriod", () => {
  const renewal = new Date("2026-01-01T00:00:00Z")

  it("is false before the renewal date", () => {
    expect(isPastGracePeriod(renewal, new Date("2025-12-01T00:00:00Z"))).toBe(false)
  })

  it("is false during the grace period", () => {
    expect(isPastGracePeriod(renewal, new Date("2026-01-15T00:00:00Z"))).toBe(false)
  })

  it("is false on the last day of grace", () => {
    const lastDay = gracePeriodEnd(renewal)
    lastDay.setUTCHours(lastDay.getUTCHours() - 1)
    expect(isPastGracePeriod(renewal, lastDay)).toBe(false)
  })

  it("is true once grace has passed", () => {
    const after = gracePeriodEnd(renewal)
    after.setUTCDate(after.getUTCDate() + 1)
    expect(isPastGracePeriod(renewal, after)).toBe(true)
  })
})

describe("renewalDateForPayment", () => {
  it("gives a term from the payment date", () => {
    const now = new Date("2026-06-15T09:30:00Z")
    expect(renewalDateForPayment(now).toISOString())
      .toBe(new Date("2027-06-15T09:30:00Z").toISOString())
  })

  it("is idempotent for a given payment time", () => {
    // A single payment can pass through more than one activation path in the
    // webhook handler; applying it twice must not hand out a two-year term.
    const now = new Date("2026-06-15T09:30:00Z")
    expect(renewalDateForPayment(now).toISOString())
      .toBe(renewalDateForPayment(now).toISOString())
  })

  it("does not depend on the member's existing renewal date", () => {
    const now = new Date("2026-06-15T09:30:00Z")
    expect(renewalDateForPayment(now).getUTCFullYear()).toBe(2027)
  })
})
