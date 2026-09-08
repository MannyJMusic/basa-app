import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { prisma } from "@/lib/db"
import { requireAdmin, requireSession, isResponse } from "@/lib/api-auth"

const createVenueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  website: z.string().url().optional().or(z.literal("")),
})

// Listing venues is needed to populate the event form, so any signed-in user may
// read; only admins may create.
export async function GET() {
  const session = await requireSession()
  if (isResponse(session)) return session

  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        capacity: true,
      },
    })
    return NextResponse.json(venues)
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to load venues" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  try {
    const data = createVenueSchema.parse(await request.json())

    const venue = await prisma.venue.create({
      data: {
        name: data.name,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        capacity: data.capacity ?? null,
        website: data.website || null,
      },
    })

    return NextResponse.json(venue, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 })
  }
}
