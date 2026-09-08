import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { prisma } from "@/lib/db"
import { requireAdmin, requireSession, isResponse } from "@/lib/api-auth"

const createOrganizerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  memberId: z.string().optional(),
})

// Listing organizers is needed to populate the event form, so any signed-in user
// may read; only admins may create.
export async function GET() {
  const session = await requireSession()
  if (isResponse(session)) return session

  try {
    const organizers = await prisma.organizer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, website: true, memberId: true },
    })
    return NextResponse.json(organizers)
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to load organizers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  try {
    const data = createOrganizerSchema.parse(await request.json())

    const organizer = await prisma.organizer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        memberId: data.memberId || null,
      },
    })

    return NextResponse.json(organizer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to create organizer" }, { status: 500 })
  }
}
