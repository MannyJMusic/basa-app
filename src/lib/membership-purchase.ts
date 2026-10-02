import { z } from 'zod'
import { MEMBERSHIP_TIER_VALUES } from '@/lib/membership-tiers'

/** The join form, as POST /api/payments/membership accepts it. Shared with the client form. */
export const membershipPurchaseSchema = z.object({
  tier: z.string().min(1).max(40),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254),
  phone: z.string().trim().max(40).optional().default(''),
  businessName: z.string().trim().min(1, 'Business name is required').max(200),
  website: z.string().trim().max(300).optional().default(''),
  businessAddress: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  state: z.string().trim().max(40).optional().default(''),
  zipCode: z.string().trim().max(20).optional().default(''),
  showInDirectory: z.boolean().default(true),
  showAddress: z.boolean().default(false),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the membership terms' }) }),
}).strict()

export type MembershipPurchaseInput = z.infer<typeof membershipPurchaseSchema>

export const MEMBERSHIP_TIER_ENUM = z.enum(MEMBERSHIP_TIER_VALUES)

/** Days before renewal from which an office-billed member may buy online. */
export const EARLY_RENEWAL_WINDOW_DAYS = 60

/**
 * Why this member should not buy another membership right now, or null if they may.
 * Stops a member with a running subscription, or an office-billed member far from
 * renewal, from paying twice.
 */
export function membershipPurchaseBlock(
  member: { membershipStatus: string; subscriptionId: string | null; renewalDate: Date | null },
  now: Date = new Date(),
): string | null {
  if (member.membershipStatus !== 'ACTIVE') return null
  if (member.subscriptionId) {
    return 'It renews automatically, so there is nothing to buy. To change your level, contact the office.'
  }
  if (!member.renewalDate) {
    return 'To renew or change your level, contact the office.'
  }
  const days = (member.renewalDate.getTime() - now.getTime()) / 86_400_000
  if (days > EARLY_RENEWAL_WINDOW_DAYS) {
    return `You can renew online from ${EARLY_RENEWAL_WINDOW_DAYS} days before then. To change your level sooner, contact the office.`
  }
  return null
}
