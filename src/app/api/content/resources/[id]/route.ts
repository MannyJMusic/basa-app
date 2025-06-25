import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Validation schema for updating resources
const updateResourceSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  isActive: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  memberId: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        member: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateResourceSchema.parse(body)

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id },
    })

    if (!existingResource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        member: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(resource)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating resource:", error)
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id },
    })

    if (!existingResource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    await prisma.resource.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    )
  }
} 