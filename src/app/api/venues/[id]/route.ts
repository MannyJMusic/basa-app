import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { prisma } from "@/lib/db"
import { requireAdmin, isResponse } from "@/lib/api-auth"

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v)

const updateVenueSchema = z.object({
  name: z.string().trim().min(1).optional(),
  address: z.preprocess(blank, z.string().nullable()).optional(),
  city: z.preprocess(blank, z.string().nullable()).optional(),
  state: z.preprocess(blank, z.string().nullable()).optional(),
  zipCode: z.preprocess(blank, z.string().nullable()).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  website: z.preprocess(blank, z.string().url().nullable()).optional(),
  image: z.preprocess(blank, z.string().url().nullable()).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params
  try {
    const data = updateVenueSchema.parse(await request.json())
    const existing = await prisma.venue.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    const venue = await prisma.venue.update({ where: { id }, data })
    return NextResponse.json(venue)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params
  const venue = await prisma.venue.findUnique({ where: { id }, select: { id: true, _count: { select: { events: true } } } })
  if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 })
  if (venue._count.events > 0) {
    return NextResponse.json({ error: `${venue._count.events} event(s) use this venue. Move them first.` }, { status: 409 })
  }
  await prisma.venue.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
