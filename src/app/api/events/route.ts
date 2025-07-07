import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"

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
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
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
  organizerId: z.string().min(1, "Organizer is required"),
  tags: z.array(z.string()).default([]),
})

const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  type: z.enum(["NETWORKING", "SUMMIT", "RIBBON_CUTTING", "COMMUNITY"]).optional(),
  category: z.string().optional(),
  isFeatured: z.string().transform(val => val === "true").optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  sortBy: z.enum(["title", "startDate", "createdAt", "capacity"]).default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams))
    console.log('API /api/events GET params:', params)

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

    // Status filter
    if (params.status) {
      where.status = params.status
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

    console.log('API /api/events GET where:', JSON.stringify(where, null, 2))

    // Build order by clause
    const orderBy: any = {}
    orderBy[params.sortBy] = params.sortOrder

    // Calculate pagination
    const skip = (params.page - 1) * params.limit

    // Get events with pagination - minimal query to isolate the issue
    let events = [];
    let total = 0;
    
    try {
      console.log('API /api/events GET - Attempting to fetch events...');
      
      const prisma = getPrisma();
      
      // First, try a simple count
      total = await prisma.event.count({ where });
      console.log('API /api/events GET - Count successful:', total);
      
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
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
        skip,
        take: params.limit,
      });
      
      console.log('API /api/events GET - Events fetch successful:', events.length);
    } catch (dbError) {
      console.error('API /api/events GET - Database error:', dbError);
      throw dbError;
    }

    // Add basic organizer info separately to avoid relation issues
    const eventsWithOrganizer = events.map((event: any) => {
      return {
        ...event,
        organizer: null, // Skip organizer for now to isolate the issue
        registrations: [],
        speakers: [],
        sponsors: [],
      };
    });

    console.log('API /api/events GET - Prisma query results:')
    console.log('  Total events found:', total)
    console.log('  Events returned:', eventsWithOrganizer.length)
    console.log('  First event (if any):', eventsWithOrganizer[0] ? { id: eventsWithOrganizer[0].id, title: eventsWithOrganizer[0].title, status: eventsWithOrganizer[0].status, endDate: eventsWithOrganizer[0].endDate } : 'none')

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

    console.log('API /api/events GET - Response:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Debug: Log request details
    console.log('API /api/events POST - Request details:')
    console.log('  Content-Type:', request.headers.get('content-type'))
    console.log('  Method:', request.method)
    console.log('  URL:', request.url)

    let body;
    try {
      body = await request.json()
      console.log('API /api/events POST - Request body:', JSON.stringify(body, null, 2))
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
    console.log('API /api/events POST - Validated data:', JSON.stringify(validatedData, null, 2))

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

    // Check if organizer exists
    const organizerCheck = await prisma.member.findUnique({
      where: { id: validatedData.organizerId },
    })

    if (!organizerCheck) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
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
        organizerId: validatedData.organizerId,
        tags: validatedData.tags,
      },
    })

    // Fetch organizer info separately to avoid relation issues
    const organizer = await prisma.member.findUnique({
      where: { id: event.organizerId },
      select: {
        id: true,
        businessName: true,
        businessEmail: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

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