import {
  isExpired,
  membershipTermEnd,
  renewalDateForPayment,
} from "@/lib/membership-lifecycle"

describe("membershipTermEnd", () => {
  it("adds a year", () => {
    expect(membershipTermEnd(new Date("2026-03-10T12:00:00Z")).toISOString())
      .toBe("2027-03-10T12:00:00.000Z")
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

describe("isExpired", () => {
  const renewal = new Date("2026-01-01T00:00:00Z")

  it("is false well before the renewal date", () => {
    expect(isExpired(renewal, new Date("2025-12-01T00:00:00Z"))).toBe(false)
  })

  it("is false a second before the renewal date", () => {
    expect(isExpired(renewal, new Date("2025-12-31T23:59:59Z"))).toBe(false)
  })

  it("is false exactly on the renewal date", () => {
    expect(isExpired(renewal, renewal)).toBe(false)
  })

  it("is true a second after the renewal date", () => {
    // No grace period: a membership lapses the moment its term ends.
    expect(isExpired(renewal, new Date("2026-01-01T00:00:01Z"))).toBe(true)
  })

  it("is true well after the renewal date", () => {
    expect(isExpired(renewal, new Date("2026-02-01T00:00:00Z"))).toBe(true)
  })
})

describe("renewalDateForPayment", () => {
  it("gives a term from the payment date", () => {
    const now = new Date("2026-06-15T09:30:00Z")
    expect(renewalDateForPayment(now).toISOString()).toBe("2027-06-15T09:30:00.000Z")
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
