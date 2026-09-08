import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { prisma } from "@/lib/db"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { soldCounts, syncEventPricingFromTiers } from "@/lib/ticket-tiers"

const tierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  memberPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().positive().optional(),
  salesStartAt: z.string().datetime().optional(),
  salesEndAt: z.string().datetime().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

// Public: the ticket types and how many remain. Buyers need this to choose.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params

  try {
    const tiers = await prisma.ticketTier.findMany({
      where: { eventId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    })
    const sold = await soldCounts(eventId)

    return NextResponse.json(
      tiers.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        price: t.price,
        memberPrice: t.memberPrice,
        salesStartAt: t.salesStartAt,
        salesEndAt: t.salesEndAt,
        // null quantity means unlimited, bounded only by the event's capacity
        remaining: t.quantity === null ? null : Math.max(0, t.quantity - (sold.perTier.get(t.id) ?? 0)),
      }))
    )
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to load ticket tiers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  const { id: eventId } = await params

  try {
    const data = tierSchema.parse(await request.json())

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } })
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    const tier = await prisma.ticketTier.create({
      data: {
        eventId,
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        memberPrice: data.memberPrice ?? null,
        quantity: data.quantity ?? null,
        salesStartAt: data.salesStartAt ? new Date(data.salesStartAt) : null,
        salesEndAt: data.salesEndAt ? new Date(data.salesEndAt) : null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    })

    // Keep the event's displayed "from" price honest.
    await syncEventPricingFromTiers(eventId)

    return NextResponse.json(tier, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to create ticket tier" }, { status: 500 })
  }
}
