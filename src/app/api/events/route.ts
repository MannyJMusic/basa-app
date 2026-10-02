import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { auth } from "@/lib/auth"
import { parseEventDateTime } from "@/lib/event-time"
import { matchVenue } from "@/lib/venues"
import { findDuplicates } from "@/lib/event-duplicates"

// Get Prisma client dynamically to support test injection
const getPrisma = () => {
  const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined
  };
  return globalForPrisma.prisma || require("@/lib/db").prisma;
};

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  // ISO with a zone, or the naive wall clock a datetime-local input produces
  // (read as America/Chicago). Validated properly below, after parsing.
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  capacity: z.number().positive().optional(),
  price: z.number().nonnegative().optional(),
  memberPrice: z.number().nonnegative().optional(),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["NETWORKING", "SUMMIT", "RIBBON_CUTTING", "COMMUNITY"]).default("NETWORKING"),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  image: z.string().url().optional(),
  // BASA runs its own events; an organizer is only recorded when there is a separate one.
  organizerId: z.string().min(1).nullable().optional(),
  tags: z.array(z.string()).default([]),
  venueId: z.string().min(1).nullable().optional(),
  /** Create even though an event with the same title is already on the same day. */
  allowDuplicate: z.boolean().default(false),
  /** Reuse the venue whose name matches `location`, or create one from the address fields (#274). */
  autoVenue: z.boolean().default(false),
  /** Ticket types created with the event, so a flyer-made event can be sold at once (#274). */
  ticketTiers: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        price: z.number().nonnegative(),
        audience: z.enum(["ALL", "MEMBER", "NON_MEMBER"]).default("ALL"),
        description: z.string().trim().max(500).optional(),
      }),
    )
    .max(20)
    .optional(),
})

const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  type: z.enum(["NETWORKING", "SUMMIT", "RIBBON_CUTTING", "COMMUNITY"]).optional(),
  category: z.string().optional(),
  isFeatured: z.string().transform(val => val === "true").optional(),
  // A time window, as ISO instants. An event is in the window when it overlaps
  // it, so `from` compares against endDate and `to` against startDate: an event
  // that started this morning and runs until tonight is still upcoming at noon.
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  sortBy: z.enum(["title", "startDate", "createdAt", "capacity"]).default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams))

    // Build where clause for filtering
    const where: any = {}

    // Search functionality
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { location: { contains: params.search, mode: "insensitive" } },
        { category: { contains: params.search, mode: "insensitive" } },
      ]
    }

    // Status filter. This route is public: drafts and cancelled events are only
    // visible to admins (2026-09-22 audit, M-A4). Asking for a non-public status
    // without being an admin matches nothing.
    const session = await auth()
    if (session?.user?.role === "ADMIN") {
      if (params.status) where.status = params.status
    } else {
      const PUBLIC_STATUSES = ["PUBLISHED", "COMPLETED"]
      where.status = {
        in: PUBLIC_STATUSES.filter(s => !params.status || s === params.status),
      }
    }

    // Type filter
    if (params.type) {
      where.type = params.type
    }

    // Category filter
    if (params.category) {
      where.category = params.category
    }

    // Featured filter
    if (params.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured
    }

    // Time window. Without this the public "Upcoming Events" page asks for every
    // published event sorted ascending, which after the WordPress import (#57)
    // means it opens on 2020.
    if (params.from) {
      where.endDate = { gte: new Date(params.from) }
    }
    if (params.to) {
      where.startDate = { lte: new Date(params.to) }
    }


    // Build order by clause
    const orderBy: any = {}
    orderBy[params.sortBy] = params.sortOrder

    // Calculate pagination
    const skip = (params.page - 1) * params.limit

    // Get events with pagination - minimal query to isolate the issue
    let events = [];
    let total = 0;
    
    try {
      
      const prisma = getPrisma();
      
      // First, try a simple count
      total = await prisma.event.count({ where });
      
      // Then, try to fetch events
      events = await prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          shortDescription: true,
          startDate: true,
          endDate: true,
          location: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          capacity: true,
          price: true,
          memberPrice: true,
          category: true,
          type: true,
          status: true,
          isFeatured: true,
          image: true,
          organizerId: true,
          venueId: true,
          venue: { select: { id: true, name: true, image: true } },
          organizer: { select: { id: true, name: true, email: true } },
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
        skip,
        take: params.limit,
      });
      
    } catch (dbError) {
      console.error('API /api/events GET - Database error:', dbError);
      throw dbError;
    }

    // `organizer` is null for BASA's own events; the UI shows it only when set.
    const eventsWithOrganizer = events.map((event: any) => {
      return {
        ...event,
        registrations: [],
        speakers: [],
        sponsors: [],
      };
    });


    // Calculate pagination info
    const totalPages = Math.ceil(total / params.limit)
    const hasNextPage = params.page < totalPages
    const hasPrevPage = params.page > 1

    const response = {
      events: eventsWithOrganizer,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    }


    return NextResponse.json(response)
  } catch (error) {
    // A malformed query parameter is the caller's mistake, not a server fault.
    // Answering 500 hides it, and a caller retrying on 500 never learns why.
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    // Debug: Log request details

    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('API /api/events POST - Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: "Invalid JSON in request body", details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 }
      )
    }

    if (!body || typeof body !== 'object') {
      console.error('API /api/events POST - Request body is not an object:', body)
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      )
    }

    const validatedData = createEventSchema.parse(body)

    const prisma = getPrisma();
    
    // Check if event slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingEvent) {
      return NextResponse.json(
        { error: "Event with this slug already exists" },
        { status: 400 }
      )
    }

    const startDate = parseEventDateTime(validatedData.startDate)
    const endDate = parseEventDateTime(validatedData.endDate)
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end must be valid dates and times" }, { status: 400 })
    }
    if (endDate <= startDate) {
      return NextResponse.json({ error: "End must be after start" }, { status: 400 })
    }

    // Check the organizer only when one was chosen
    const organizerId = validatedData.organizerId || null
    if (organizerId) {
      const organizerCheck = await prisma.organizer.findUnique({ where: { id: organizerId } })
      if (!organizerCheck) {
        return NextResponse.json({ error: "Organizer not found" }, { status: 400 })
      }
    }

    // Same title on the same day is almost always a re-issued flyer: update the
    // existing event instead. Different dates of the same title are fine.
    if (!validatedData.allowDuplicate) {
      const existing = await prisma.event.findMany({ select: { id: true, title: true, slug: true, startDate: true, location: true, status: true } })
      const { matches } = findDuplicates({ title: validatedData.title, startDate, location: validatedData.location }, existing)
      if (matches.length > 0) {
        return NextResponse.json(
          { error: `An event like this is already on that date: "${matches[0].title}"`, duplicates: matches },
          { status: 409 },
        )
      }
    }

    // Venue: an explicit id, else (opt-in) a name match or a new record from the address.
    let venueId: string | null = validatedData.venueId || null
    if (venueId) {
      const venueCheck = await prisma.venue.findUnique({ where: { id: venueId } })
      if (!venueCheck) {
        return NextResponse.json({ error: "Venue not found" }, { status: 400 })
      }
    }

    const tierInputs = validatedData.ticketTiers ?? []

    // Event, venue link and tickets succeed or fail together.
    const event = await prisma.$transaction(async (tx: any) => {
      if (!venueId && validatedData.autoVenue) {
        const known = await tx.venue.findMany({ select: { id: true, name: true } })
        const found = matchVenue(known as { id: string; name: string }[], validatedData.location)
        if (found) venueId = found.id
        else {
          const created = await tx.venue.create({
            data: {
              name: validatedData.location.trim(),
              address: validatedData.address || null,
              city: validatedData.city || null,
              state: validatedData.state || null,
              zipCode: validatedData.zipCode || null,
            },
          })
          venueId = created.id
        }
      }

      const created = await tx.event.create({
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          shortDescription: validatedData.shortDescription,
          startDate,
          endDate,
          location: validatedData.location,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          capacity: validatedData.capacity,
          price: validatedData.price,
          memberPrice: validatedData.memberPrice,
          category: validatedData.category,
          type: validatedData.type,
          status: validatedData.status,
          isFeatured: validatedData.isFeatured,
          image: validatedData.image,
          organizerId,
          venueId,
          tags: validatedData.tags,
        },
      })

      // Non-member tiers first so each member tier can point at the one it is held at.
      const ordered = [...tierInputs].sort((a, b) => (a.audience === "NON_MEMBER" ? 0 : 1) - (b.audience === "NON_MEMBER" ? 0 : 1))
      let firstNonMemberId: string | null = null
      for (let i = 0; i < ordered.length; i++) {
        const t = ordered[i]
        const tier: { id: string } = await tx.ticketTier.create({
          data: {
            eventId: created.id,
            name: t.name,
            description: t.description ?? null,
            price: t.price,
            audience: t.audience,
            sortOrder: i,
            nonMemberTierId: t.audience === "MEMBER" ? firstNonMemberId : null,
          },
        })
        if (t.audience === "NON_MEMBER" && !firstNonMemberId) firstNonMemberId = tier.id
      }
      return created
    })

    const organizer = event.organizerId
      ? await prisma.organizer.findUnique({
          where: { id: event.organizerId },
          select: { id: true, name: true, email: true },
        })
      : null;

    const eventWithOrganizer = {
      ...event,
      organizer: organizer || null,
      registrations: [],
      speakers: [],
      sponsors: [],
    };

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_EVENT",
        entityType: "EVENT",
        entityId: event.id,
        newValues: {
          eventId: event.id,
          title: event.title,
          slug: event.slug,
          status: event.status,
          organizerId: event.organizerId,
        },
      },
    })

    return NextResponse.json(eventWithOrganizer)
  } catch (error) {
    console.error("Error creating event:", error)
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", JSON.stringify(error.errors, null, 2))
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
} 