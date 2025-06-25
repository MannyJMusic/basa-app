import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Validation schema for updating an event
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  capacity: z.number().positive().optional(),
  price: z.number().nonnegative().optional(),
  memberPrice: z.number().nonnegative().optional(),
  category: z.string().min(1).optional(),
  type: z.enum(["NETWORKING", "SUMMIT", "RIBBON_CUTTING", "COMMUNITY"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  isFeatured: z.boolean().optional(),
  image: z.string().url().optional(),
  organizerId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        registrations: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        speakers: {
          orderBy: { order: "asc" },
        },
        sponsors: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { tier: "asc" },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if slug is being changed and if it's already taken
    if (validatedData.slug && validatedData.slug !== existingEvent.slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug: validatedData.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: "Event with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Check if organizer is being changed and if it exists
    if (validatedData.organizerId && validatedData.organizerId !== existingEvent.organizerId) {
      const organizer = await prisma.member.findUnique({
        where: { id: validatedData.organizerId },
      })
      if (!organizer) {
        return NextResponse.json(
          { error: "Organizer not found" },
          { status: 400 }
        )
      }
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.shortDescription !== undefined && { shortDescription: validatedData.shortDescription }),
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
        ...(validatedData.location && { location: validatedData.location }),
        ...(validatedData.address !== undefined && { address: validatedData.address }),
        ...(validatedData.city !== undefined && { city: validatedData.city }),
        ...(validatedData.state !== undefined && { state: validatedData.state }),
        ...(validatedData.zipCode !== undefined && { zipCode: validatedData.zipCode }),
        ...(validatedData.capacity !== undefined && { capacity: validatedData.capacity }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.memberPrice !== undefined && { memberPrice: validatedData.memberPrice }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.isFeatured !== undefined && { isFeatured: validatedData.isFeatured }),
        ...(validatedData.image !== undefined && { image: validatedData.image }),
        ...(validatedData.organizerId && { organizerId: validatedData.organizerId }),
        ...(validatedData.tags && { tags: validatedData.tags }),
      },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        registrations: {
          select: {
            id: true,
            status: true,
          },
        },
        speakers: {
          select: {
            id: true,
            name: true,
          },
        },
        sponsors: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_EVENT",
        entityType: "EVENT",
        entityId: id,
        oldValues: {
          eventId: existingEvent.id,
          title: existingEvent.title,
          slug: existingEvent.slug,
          status: existingEvent.status,
          organizerId: existingEvent.organizerId,
        },
        newValues: {
          eventId: updatedEvent.id,
          title: updatedEvent.title,
          slug: updatedEvent.slug,
          status: updatedEvent.status,
          organizerId: updatedEvent.organizerId,
        },
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        registrations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if event has registrations
    if (existingEvent.registrations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete event with existing registrations" },
        { status: 400 }
      )
    }

    // Delete event (this will cascade delete speakers, sponsors, etc.)
    await prisma.event.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_EVENT",
        entityType: "EVENT",
        entityId: id,
        oldValues: {
          eventId: existingEvent.id,
          title: existingEvent.title,
          slug: existingEvent.slug,
          status: existingEvent.status,
          organizerId: existingEvent.organizerId,
        },
      },
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
} 