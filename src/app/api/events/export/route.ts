import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const exportParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  type: z.enum(["NETWORKING", "SUMMIT", "RIBBON_CUTTING", "COMMUNITY"]).optional(),
  category: z.string().optional(),
  isFeatured: z.string().transform(val => val === "true").optional(),
  format: z.enum(["csv", "json"]).default("csv"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = exportParamsSchema.parse(Object.fromEntries(searchParams))

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

    // Get all events matching the filters
    const events = await prisma.event.findMany({
      where,
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
      orderBy: { startDate: "desc" },
    })

    if (params.format === "json") {
      return NextResponse.json({ events })
    }

    // Generate CSV
    const csvHeaders = [
      "ID",
      "Title",
      "Slug",
      "Description",
      "Short Description",
      "Start Date",
      "End Date",
      "Location",
      "Address",
      "City",
      "State",
      "ZIP Code",
      "Capacity",
      "Price",
      "Member Price",
      "Category",
      "Type",
      "Status",
      "Featured",
      "Organizer",
      "Organizer Email",
      "Tags",
      "Registration Count",
      "Speaker Count",
      "Sponsor Count",
      "Created At",
      "Updated At",
    ]

    const csvRows = events.map((event) => [
      event.id,
      event.title,
      event.slug,
      event.description,
      event.shortDescription || "",
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      event.location,
      event.address || "",
      event.city || "",
      event.state || "",
      event.zipCode || "",
      event.capacity || "",
      event.price?.toString() || "",
      event.memberPrice?.toString() || "",
      event.category,
      event.type,
      event.status,
      event.isFeatured ? "Yes" : "No",
      `${event.organizer.user.firstName || ""} ${event.organizer.user.lastName || ""}`.trim(),
      event.organizer.user.email || "",
      (event.tags || []).join(", "),
      event.registrations.length,
      event.speakers.length,
      event.sponsors.length,
      event.createdAt.toISOString(),
      event.updatedAt.toISOString(),
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="basa-events-${new Date().toISOString().split("T")[0]}.csv"`
    )

    return response
  } catch (error) {
    console.error("Error exporting events:", error)
    return NextResponse.json(
      { error: "Failed to export events" },
      { status: 500 }
    )
  }
} 