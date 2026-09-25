/**
 * Who a ticket tier is for, from its name. MEC sold member and non-member prices as
 * separate tickets told apart only by name ("Member Rate", "Future Member",
 * "Non-Member Admission"). The same rules backfilled every imported tier in
 * migration 20260925000000_member_rate_requests; the WordPress importer uses them
 * for tiers it creates, so an imported member tier is never sold to guests.
 *
 * "Future ..." is how BASA labels the non-member rate. "Membership" (a membership
 * sale, e.g. "3-Month Trial Membership") is not a member-only ticket.
 */
export type TierAudience = 'ALL' | 'MEMBER' | 'NON_MEMBER'

export function audienceFromName(name: string): TierAudience {
  if (/non[\s-]*member|\bfuture/i.test(name)) return 'NON_MEMBER'
  if (/\bmembers?\b/i.test(name)) return 'MEMBER'
  return 'ALL'
}

/**
 * The non-member tier a member tier should be held at for a verification request:
 * only when the event has exactly one of each, as the migration did. Returns null
 * when the pairing is ambiguous; an admin pairs those in the tier editor.
 */
export function autoPairing<T extends { id: string; audience: TierAudience }>(tiers: T[]): { memberTierId: string; nonMemberTierId: string } | null {
  const member = tiers.filter(t => t.audience === 'MEMBER')
  const nonMember = tiers.filter(t => t.audience === 'NON_MEMBER')
  return member.length === 1 && nonMember.length === 1
    ? { memberTierId: member[0].id, nonMemberTierId: nonMember[0].id }
    : null
}
