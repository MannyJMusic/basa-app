import { z } from 'zod'
import { prisma } from '@/lib/db'
import { soldCounts } from '@/lib/ticket-tiers'

/** Shared by the admin ticket-tier routes (#160). */
export const tierInput = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number().nonnegative(),
  memberPrice: z.number().nonnegative().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
  salesStartAt: z.string().datetime().optional().nullable(),
  salesEndAt: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  audience: z.enum(['ALL', 'MEMBER', 'NON_MEMBER']).optional(),
  /** MEMBER tiers only: the NON_MEMBER tier of the same event a verification request is held at. */
  nonMemberTierId: z.string().min(1).optional().nullable(),
})

/**
 * The pairing a member tier may have: a non-member tier of the same event. A tier
 * that is not MEMBER never keeps one. Returns an error message, or the value to store.
 */
export async function resolvePairing(
  eventId: string,
  tierId: string | null,
  audience: 'ALL' | 'MEMBER' | 'NON_MEMBER',
  nonMemberTierId: string | null | undefined
): Promise<{ error: string } | { value: string | null }> {
  if (audience !== 'MEMBER' || !nonMemberTierId) return { value: null }
  if (nonMemberTierId === tierId) return { error: 'A tier cannot be paired with itself' }
  const pair = await prisma.ticketTier.findFirst({ where: { id: nonMemberTierId, eventId }, select: { audience: true } })
  if (!pair) return { error: 'The paired tier is not part of this event' }
  if (pair.audience !== 'NON_MEMBER') return { error: 'A member tier can only be paired with a non-member tier' }
  return { value: nonMemberTierId }
}

export async function listTiersForAdmin(eventId: string) {
  const [tiers, sold] = await Promise.all([
    prisma.ticketTier.findMany({ where: { eventId }, orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] }),
    soldCounts(eventId),
  ])
  return tiers.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    price: Number(t.price),
    memberPrice: t.memberPrice === null ? null : Number(t.memberPrice),
    quantity: t.quantity,
    sold: sold.perTier.get(t.id) ?? 0,
    salesStartAt: t.salesStartAt,
    salesEndAt: t.salesEndAt,
    sortOrder: t.sortOrder,
    isActive: t.isActive,
    audience: t.audience,
    nonMemberTierId: t.nonMemberTierId,
  }))
}

