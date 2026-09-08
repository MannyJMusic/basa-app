import { prisma } from "@/lib/db"

/**
 * BASA memberships are a one-time annual charge, not a subscription: every PMPro
 * level carried `billing_amount = 0` with a 1-year expiry. Nothing recurring will
 * arrive from Stripe to end a membership, so expiry is driven from here.
 */
export const MEMBERSHIP_TERM_YEARS = 1

/**
 * Days a lapsed member keeps access after `renewalDate` before being marked
 * EXPIRED. A placeholder default - confirm the real grace period with BASA.
 */
export const GRACE_PERIOD_DAYS = 30

// UTC throughout: local-time date arithmetic drifts by an hour across a DST
// boundary, so the same code would produce different results on a UTC server
// than on a developer's machine.
export function membershipTermEnd(from: Date): Date {
  const end = new Date(from)
  end.setUTCFullYear(end.getUTCFullYear() + MEMBERSHIP_TERM_YEARS)
  return end
}

export function gracePeriodEnd(renewalDate: Date): Date {
  const end = new Date(renewalDate)
  end.setUTCDate(end.getUTCDate() + GRACE_PERIOD_DAYS)
  return end
}

export function isPastGracePeriod(renewalDate: Date, now: Date = new Date()): boolean {
  return now.getTime() > gracePeriodEnd(renewalDate).getTime()
}

/**
 * The renewal date a successful membership payment sets: a flat term from the
 * payment, matching how PMPro issued these levels.
 *
 * Deliberately not "extend the existing term". A single payment can touch several
 * activation paths in the webhook handler, and a flat set is idempotent where an
 * extension would silently hand out a two-year term. The cost is that renewing
 * early forfeits the remaining days; with annual renewals at or after expiry that
 * is a fair trade for not being able to get it wrong.
 */
export function renewalDateForPayment(now: Date = new Date()): Date {
  return membershipTermEnd(now)
}

export interface ExpirySweepResult {
  expired: number
  /** ACTIVE members with no renewalDate: they can never expire and need backfilling. */
  missingRenewalDate: number
}

/**
 * Moves ACTIVE members whose grace period has passed to EXPIRED.
 *
 * Members with a null `renewalDate` are counted but deliberately left alone -
 * every membership activated before this lifecycle existed has one, and guessing
 * a date for them would silently revoke access.
 */
export async function expireLapsedMemberships(now: Date = new Date()): Promise<ExpirySweepResult> {
  const cutoff = new Date(now)
  cutoff.setUTCDate(cutoff.getUTCDate() - GRACE_PERIOD_DAYS)

  const [{ count }, missingRenewalDate] = await Promise.all([
    prisma.member.updateMany({
      where: {
        membershipStatus: "ACTIVE",
        renewalDate: { not: null, lt: cutoff },
      },
      data: { membershipStatus: "EXPIRED" },
    }),
    prisma.member.count({
      where: { membershipStatus: "ACTIVE", renewalDate: null },
    }),
  ])

  return { expired: count, missingRenewalDate }
}
