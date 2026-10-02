/**
 * Claiming a legacy account (#104).
 *
 * The PMPro importer (#58) brings 135 people over with no password, `GUEST`,
 * `INACTIVE` and `isActive: false`. That is deliberate: WordPress hashes are phpass
 * and this app uses bcrypt, so nothing carries over, and importing a usable
 * credential would be worse than importing none. The importer also sends no email -
 * a migration script is the wrong thing to be mailing 135 people from.
 *
 * The consequence is that none of them can sign in, and until this existed there was
 * no flow that would let them. The owner's decision (2026-09-13) was **on renewal
 * only**: nobody is emailed because of the migration, and a claim link is issued when
 * a member comes back of their own accord. In practice that means the forgot-password
 * form, which is where someone who cannot get in actually goes.
 */
import type { AccountStatus, Status } from '@prisma/client'

/** The subset of a User this module needs. Keeps it testable without a database. */
export interface ClaimableUser {
  hashedPassword: string | null
  accountStatus: AccountStatus
}

/**
 * Whether this account has never been claimed, and so should be offered a claim
 * rather than a password reset.
 *
 * Both conditions matter:
 *
 * - **No password** distinguishes an imported record from a real account. Anyone who
 *   has ever set one is doing a password reset, not a claim.
 * - **`INACTIVE`** keeps this away from accounts an admin deliberately turned off and
 *   from Google sign-ins, which also carry no password but are `ACTIVE` or
 *   `PENDING_VERIFICATION`. A suspended member must not be able to reactivate
 *   themselves by asking for a password reset.
 */
export function isUnclaimedLegacyAccount(user: ClaimableUser): boolean {
  return user.hashedPassword === null && user.accountStatus === 'INACTIVE'
}

/**
 * What claiming always changes on the User row, beyond setting the password: the
 * account becomes usable. Role is decided separately by `claimActivation`.
 */
export const CLAIM_ACTIVATION = {
  isActive: true,
  accountStatus: 'ACTIVE' as AccountStatus,
} as const

/** The subset of a User (with its Member row) that decides the claimed role. */
export interface ClaimRoleInput {
  role: string
  member?: { membershipStatus: Status } | null
}

/**
 * Everything a successful claim writes, beyond the password.
 *
 * Role follows the membership, not the claim: a `GUEST` whose Member row is
 * `ACTIVE` (an invited current member, or an imported one staff have confirmed)
 * becomes `MEMBER`, otherwise they would set a password and still be shown as a
 * guest with no member pricing. A lapsed member (Member row not `ACTIVE`) stays
 * `GUEST`: claiming proves who you are and gets you into your account, it does
 * not hand back a membership; the Stripe webhook promotes them when they renew.
 * No other role is ever changed here - an ADMIN or MODERATOR stays what they are.
 */
export function claimActivation(user: ClaimRoleInput): {
  isActive: true
  accountStatus: AccountStatus
  role?: 'MEMBER'
} {
  const promote = user.role === 'GUEST' && user.member?.membershipStatus === 'ACTIVE'
  return promote ? { ...CLAIM_ACTIVATION, role: 'MEMBER' } : { ...CLAIM_ACTIVATION }
}
