import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { parseEventDateTime } from "@/lib/event-time"
import { findDuplicates } from "@/lib/event-duplicates"

const input = z.object({
  title: z.string().min(1),
  startDate: z.string().min(1),
  location: z.string().optional(),
  excludeId: z.string().optional(),
})

/**
 * POST { title, startDate, location? } -> { matches, otherDates }
 * Same-day matches should be updated rather than recreated; other dates of the
 * same title are returned only so the admin can see they were checked.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const parsed = input.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "title and startDate are required" }, { status: 400 })
  const start = parseEventDateTime(parsed.data.startDate)
  if (!start) return NextResponse.json({ error: "startDate is not a valid date" }, { status: 400 })

  const existing = await prisma.event.findMany({ select: { id: true, title: true, slug: true, startDate: true, location: true, status: true } })
  return NextResponse.json(
    findDuplicates({ title: parsed.data.title, startDate: start, location: parsed.data.location }, existing, { excludeId: parsed.data.excludeId }),
  )
}
