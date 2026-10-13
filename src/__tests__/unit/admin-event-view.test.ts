/** @jest-environment node */
import { buildEventFilters, defaultSortOrder, isDefaultView, registrationSummary } from "@/lib/admin-event-view"

const NOW = "2026-10-13T15:00:00.000Z"

describe("buildEventFilters", () => {
  it("defaults to upcoming events with cancelled hidden", () => {
    expect(buildEventFilters({}, "upcoming", "active", NOW)).toEqual({ from: NOW, hideCancelled: true })
  })
  it("past view asks for events that ended before now and has no lower bound", () => {
    const f = buildEventFilters({}, "past", "active", NOW)
    expect(f).toEqual({ before: NOW, hideCancelled: true })
    expect(f.from).toBeUndefined()
  })
  it("all scope and all statuses sends no time or status filter", () => {
    expect(buildEventFilters({}, "all", "all", NOW)).toEqual({})
  })
  it("an explicit status replaces the hide-cancelled default, so cancelled events can be shown", () => {
    expect(buildEventFilters({}, "upcoming", "CANCELLED", NOW)).toEqual({ from: NOW, status: "CANCELLED" })
  })
  it("keeps search, type, category and featured, and drops stale time and status keys", () => {
    const f = buildEventFilters(
      { search: "taco", type: "NETWORKING", category: "Food", isFeatured: true, from: "x", before: "y", status: "DRAFT", hideCancelled: false },
      "upcoming", "active", NOW,
    )
    expect(f).toEqual({ search: "taco", type: "NETWORKING", category: "Food", isFeatured: true, from: NOW, hideCancelled: true })
  })
})

describe("defaultSortOrder", () => {
  it("is soonest first for upcoming and newest first otherwise", () => {
    expect(defaultSortOrder("upcoming")).toBe("asc")
    expect(defaultSortOrder("past")).toBe("desc")
    expect(defaultSortOrder("all")).toBe("desc")
  })
})

describe("isDefaultView", () => {
  it("is true for the untouched view, ignoring a blank search", () => {
    expect(isDefaultView({}, "upcoming", "active")).toBe(true)
    expect(isDefaultView({ search: "  " }, "upcoming", "active")).toBe(true)
  })
  it("is false once anything is changed", () => {
    expect(isDefaultView({}, "past", "active")).toBe(false)
    expect(isDefaultView({}, "upcoming", "all")).toBe(false)
    expect(isDefaultView({ type: "SUMMIT" }, "upcoming", "active")).toBe(false)
    expect(isDefaultView({ search: "x" }, "upcoming", "active")).toBe(false)
    expect(isDefaultView({ isFeatured: true }, "upcoming", "active")).toBe(false)
  })
})

describe("registrationSummary", () => {
  it("counts confirmed tickets only; pending, cancelled and refunded hold no seat", () => {
    expect(registrationSummary([
      { status: "CONFIRMED", ticketCount: 2 },
      { status: "CONFIRMED", ticketCount: 1 },
      { status: "PENDING", ticketCount: 4 },
      { status: "CANCELLED", ticketCount: 3 },
      { status: "REFUNDED", ticketCount: 1 },
    ])).toEqual({ confirmedTickets: 3, confirmed: 2, total: 5 })
  })
  it("treats a missing ticketCount as one ticket and handles none", () => {
    expect(registrationSummary([{ status: "CONFIRMED" }]).confirmedTickets).toBe(1)
    expect(registrationSummary([])).toEqual({ confirmedTickets: 0, confirmed: 0, total: 0 })
  })
})
