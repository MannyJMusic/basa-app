/**
 * Feature gates read from the server environment at request time. Server-only:
 * read them in server components, route handlers and layouts, and pass the
 * boolean down to client components as a prop.
 */

/**
 * Whether memberships can be bought or renewed online (#71 cutover decision,
 * owner 2026-09-15: event tickets only; memberships go through the BASA office
 * until further notice). Off unless the environment says `true`.
 *
 * Off means: the join and payment pages show how to reach the office instead of
 * the wizard, tier listings show no prices and no buy buttons, the dashboard shows
 * no upgrade offers, and POST /api/payments/membership answers 403.
 */
export const MEMBERSHIP_SALES_ENABLED = process.env.MEMBERSHIP_SALES_ENABLED === 'true'

/**
 * Whether the daily sweep may email members about renewals and lapsed memberships.
 * Off unless the environment says `true` (owner, 2026-10-02: no member emails go
 * out until the owner says so). Expiry itself still runs; only the emails wait.
 */
export const MEMBER_NOTICES_ENABLED = process.env.MEMBER_NOTICES_ENABLED === 'true'

/** Who handles memberships while online sales are off. */
export const OFFICE_CONTACT = {
  name: 'Jen',
  phone: '(210) 549-7190',
  phoneHref: 'tel:+12105497190',
  email: 'info@businessassociationsa.com',
} as const
