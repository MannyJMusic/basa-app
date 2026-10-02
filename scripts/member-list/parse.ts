/**
 * Parsing the office's member master list (2026 relaunch). The office keeps the
 * list as a spreadsheet; save it as CSV with the columns
 *   BUSINESS NAME, Membership, EMAILS, Expires, Contact
 * Pure functions only, so the rules are unit-tested without a database.
 *
 * Spreadsheet conventions this handles:
 *  - A `"` in Membership means "same as the row above": an extra contact at the
 *    same business. Such rows also inherit the business's expiry when theirs is blank.
 *  - Expires is free text: "2027 - July", "2026 - Dec.", "2027 -Sept", "2027-April",
 *    "2027 July", or "Monthly".
 *  - Levels are written in any case ("MIXER", "meeting").
 */
import type { MembershipTier } from '@prisma/client'
import { tierFromName } from '../../src/lib/membership-tiers'

export interface ListRow {
  /** 1-based spreadsheet row number, for the report. */
  row: number
  business: string
  membership: string
  email: string
  expires: string
  contact: string
}

export type Billing = { kind: 'yearly'; renewalDate: Date } | { kind: 'monthly' } | { kind: 'unknown' }

export interface ParsedMember {
  row: number
  business: string
  email: string
  firstName: string | null
  lastName: string | null
  tier: MembershipTier
  billing: Billing
  /** First contact listed for the business: the one shown in the directory. */
  primary: boolean
}

export interface Skipped {
  row: number
  business: string
  reason: string
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * The end of the month named, as the last minute of that day in San Antonio
 * (23:59 Central is 04:59 or 05:59 UTC the next day; 04:59 is safe in both).
 */
export function parseExpires(raw: string): Billing {
  const text = raw.trim().toLowerCase()
  if (!text) return { kind: 'unknown' }
  if (text === 'monthly') return { kind: 'monthly' }
  const m = /^(20\d\d)\s*-?\s*([a-z]+)\.?$/.exec(text)
  if (!m) return { kind: 'unknown' }
  const month = MONTHS.indexOf(m[2].slice(0, 3))
  if (month < 0) return { kind: 'unknown' }
  const year = Number(m[1])
  return { kind: 'yearly', renewalDate: new Date(Date.UTC(year, month + 1, 1, 4, 59)) }
}

export function splitName(contact: string): { firstName: string | null; lastName: string | null } {
  const parts = contact.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: null, lastName: null }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') || null }
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i

/** Turns spreadsheet rows into members to import, and the rows that need a person. */
export function parseMemberList(rows: ListRow[]): { members: ParsedMember[]; skipped: Skipped[] } {
  const members: ParsedMember[] = []
  const skipped: Skipped[] = []
  const seenEmails = new Set<string>()
  const primaryTaken = new Set<string>()

  let lastLevel = ''
  let lastBusiness = ''
  let lastExpires = ''

  for (const r of rows) {
    if (!r.business.trim() && !r.email.trim() && !r.membership.trim()) continue

    const ditto = r.membership.trim() === '"'
    const level = ditto ? lastLevel : r.membership.trim()
    const expires = r.expires.trim() || (ditto && r.business.trim() === lastBusiness ? lastExpires : '')
    if (!ditto) { lastLevel = level; lastBusiness = r.business.trim(); lastExpires = r.expires.trim() }

    const business = r.business.trim()
    const tier = tierFromName(level)
    if (!tier) {
      skipped.push({ row: r.row, business, reason: level ? `"${level}" is not one of the five levels` : 'No level listed' })
      continue
    }
    const email = r.email.trim().toLowerCase()
    if (!email) { skipped.push({ row: r.row, business, reason: 'No email address' }); continue }
    if (!EMAIL.test(email)) { skipped.push({ row: r.row, business, reason: 'Email address is not valid' }); continue }
    if (seenEmails.has(email)) { skipped.push({ row: r.row, business, reason: 'Email listed more than once; first row kept' }); continue }
    seenEmails.add(email)

    const key = business.toLowerCase()
    const primary = !primaryTaken.has(key)
    primaryTaken.add(key)

    members.push({ row: r.row, business, email, ...splitName(r.contact), tier, billing: parseExpires(expires), primary })
  }
  return { members, skipped }
}
