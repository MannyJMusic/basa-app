import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Validation schema for creating/updating testimonials
const testimonialSchema = z.object({
  authorName: z.string().min(1, "Author name is required"),
  authorTitle: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5).default(5),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  memberId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ]
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
    ])

    return NextResponse.json({
      testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
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

    const body = await request.json()
    const validatedData = testimonialSchema.parse(body)

    const testimonial = await prisma.testimonial.create({
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

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating testimonial:", error)
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    )
  }
} 