import type { EventFilters } from "@/hooks/use-events"

/**
 * What the admin Event Management list shows by default: upcoming events, soonest
 * first, with cancelled events left out. The admin can widen it (Past, All, or a
 * specific status) from the toolbar and the filter panel.
 */
export type EventScope = "upcoming" | "past" | "all"
export type EventStatusChoice = "active" | "all" | NonNullable<EventFilters["status"]>

export const DEFAULT_SCOPE: EventScope = "upcoming"
export const DEFAULT_STATUS_CHOICE: EventStatusChoice = "active"

/** Upcoming reads soonest first; past and all read newest first. */
export function defaultSortOrder(scope: EventScope): "asc" | "desc" {
  return scope === "upcoming" ? "asc" : "desc"
}

/**
 * The API filters for a scope and status choice. `now` is captured when the scope
 * is chosen, not on every render, so the query does not change under the admin's feet.
 * An event counts as upcoming until it has finished, so one running right now stays.
 */
export function buildEventFilters(
  base: EventFilters,
  scope: EventScope,
  statusChoice: EventStatusChoice,
  nowIso: string,
): EventFilters {
  const f: EventFilters = { ...base }
  delete f.from
  delete f.before
  delete f.status
  delete f.hideCancelled
  if (scope === "upcoming") f.from = nowIso
  if (scope === "past") f.before = nowIso
  if (statusChoice === "active") f.hideCancelled = true
  else if (statusChoice !== "all") f.status = statusChoice
  return f
}

/** True when the list is showing exactly the default view (no scope or status change, no other filters). */
export function isDefaultView(
  base: EventFilters,
  scope: EventScope,
  statusChoice: EventStatusChoice,
): boolean {
  const { search, type, category, isFeatured } = base
  return (
    scope === DEFAULT_SCOPE &&
    statusChoice === DEFAULT_STATUS_CHOICE &&
    !search?.trim() && !type && !category && !isFeatured
  )
}
