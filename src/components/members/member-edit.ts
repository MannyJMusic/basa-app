import type { MembershipTier } from "@prisma/client"
import type { Member } from "@/hooks/use-members"

/**
 * The admin member edit form, as plain strings, and the diff that turns it into
 * a PUT body.
 *
 * Only fields the admin actually changed are sent. Sending the whole form used to
 * overwrite things nobody touched: a member with no tier was saved as Meeting, a
 * GUEST was saved as MEMBER, and blank optional fields were sent as "" (which
 * the API's email/url checks reject).
 */
export const MEMBER_STATUSES = ["PENDING", "ACTIVE", "EXPIRED", "INACTIVE"] as const
export type MemberStatusValue = (typeof MEMBER_STATUSES)[number]

export const MEMBER_ROLES = ["GUEST", "MEMBER", "MODERATOR", "ADMIN"] as const

/** Select value for "no tier" (Radix Select does not allow an empty value). */
export const NO_TIER = "none"

export interface MemberFormState {
  firstName: string
  lastName: string
  email: string
  role: string
  businessName: string
  businessType: string
  industry: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  city: string
  state: string
  zipCode: string
  website: string
  membershipTier: string
  membershipStatus: string
  /** yyyy-mm-dd, or "" for none. */
  renewalDate: string
}

/** A stored date as the yyyy-mm-dd a date input shows. */
export function toDateInput(value?: string | Date | null): string {
  if (!value) return ""
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

/**
 * A date input's yyyy-mm-dd as an ISO timestamp. Noon UTC, so the same calendar
 * day shows in every US time zone.
 */
export function fromDateInput(value: string): string | null {
  if (!value) return null
  const d = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function formStateFromMember(member: Member): MemberFormState {
  return {
    firstName: member.user.firstName ?? "",
    lastName: member.user.lastName ?? "",
    email: member.user.email ?? "",
    role: member.user.role ?? "GUEST",
    businessName: member.businessName ?? "",
    businessType: member.businessType ?? "",
    industry: (member.industry ?? []).join(", "),
    businessEmail: member.businessEmail ?? "",
    businessPhone: member.businessPhone ?? "",
    businessAddress: member.businessAddress ?? "",
    city: member.city ?? "",
    state: member.state ?? "",
    zipCode: member.zipCode ?? "",
    website: member.website ?? "",
    membershipTier: member.membershipTier ?? NO_TIER,
    membershipStatus: member.membershipStatus ?? "PENDING",
    renewalDate: toDateInput(member.renewalDate),
  }
}

const parseIndustry = (s: string) => s.split(",").map(i => i.trim()).filter(Boolean)

const TEXT_FIELDS = [
  "firstName", "lastName", "email", "businessName", "businessType", "businessEmail",
  "businessPhone", "businessAddress", "city", "state", "zipCode", "website",
] as const

export type MemberChanges = Partial<{
  firstName: string | null
  lastName: string | null
  email: string | null
  role: string
  businessName: string | null
  businessType: string | null
  industry: string[]
  businessEmail: string | null
  businessPhone: string | null
  businessAddress: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  website: string | null
  membershipTier: MembershipTier | null
  membershipStatus: string
  renewalDate: string | null
}>

/** The fields that differ between the loaded member and the form, ready to send. */
export function diffMemberForm(initial: MemberFormState, current: MemberFormState): MemberChanges {
  const changes: MemberChanges = {}

  for (const key of TEXT_FIELDS) {
    const before = initial[key].trim()
    const after = current[key].trim()
    if (before !== after) {
      const value = after === "" ? null : after
      ;(changes as Record<string, unknown>)[key] = key === "email" && value ? value.toLowerCase() : value
    }
  }

  const industryBefore = parseIndustry(initial.industry)
  const industryAfter = parseIndustry(current.industry)
  if (industryBefore.join("\u0000") !== industryAfter.join("\u0000")) changes.industry = industryAfter

  if (initial.role !== current.role) changes.role = current.role

  if (initial.membershipTier !== current.membershipTier) {
    changes.membershipTier = current.membershipTier === NO_TIER ? null : (current.membershipTier as MembershipTier)
  }
  if (initial.membershipStatus !== current.membershipStatus) changes.membershipStatus = current.membershipStatus
  if (initial.renewalDate !== current.renewalDate) changes.renewalDate = fromDateInput(current.renewalDate)

  return changes
}

/** The list and detail APIs return accountStatus; the shared Member type does not declare it. */
export function accountStatusOf(member: Member): string | undefined {
  return (member.user as { accountStatus?: string }).accountStatus
}

/** The API's error, with the first validation detail when there is one. */
export function apiErrorMessage(body: any, fallback: string): string {
  const detail = Array.isArray(body?.details) ? body.details[0] : undefined
  const field = Array.isArray(detail?.path) && detail.path.length ? `${detail.path.join('.')}: ` : ''
  if (detail?.message) return `${body?.error || fallback} (${field}${detail.message})`
  return body?.error || fallback
}
