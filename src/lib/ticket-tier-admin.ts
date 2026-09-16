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
})

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
  }))
}

