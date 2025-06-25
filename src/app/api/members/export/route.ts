import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const exportParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  membershipTier: z.enum(["BASIC", "PREMIUM", "VIP"]).optional(),
  industry: z.string().optional(),
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
    const where: any = {
      user: {
        isActive: true,
      },
    }

    // Search functionality
    if (params.search) {
      where.OR = [
        { user: { firstName: { contains: params.search, mode: "insensitive" } } },
        { user: { lastName: { contains: params.search, mode: "insensitive" } } },
        { user: { email: { contains: params.search, mode: "insensitive" } } },
        { businessName: { contains: params.search, mode: "insensitive" } },
        { businessEmail: { contains: params.search, mode: "insensitive" } },
      ]
    }

    // Status filter
    if (params.status) {
      where.membershipStatus = params.status
    }

    // Membership tier filter
    if (params.membershipTier) {
      where.membershipTier = params.membershipTier
    }

    // Industry filter
    if (params.industry) {
      where.industry = { has: params.industry }
    }

    // Get all members matching the filters
    const members = await prisma.member.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    })

    if (params.format === "json") {
      return NextResponse.json({ members })
    }

    // Generate CSV
    const csvHeaders = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Business Name",
      "Business Type",
      "Industry",
      "Business Email",
      "Business Phone",
      "City",
      "State",
      "Membership Tier",
      "Membership Status",
      "Role",
      "Joined Date",
      "Last Login",
    ]

    const csvRows = members.map((member) => [
      member.id,
      member.user.firstName || "",
      member.user.lastName || "",
      member.user.email || "",
      member.businessName || "",
      member.businessType || "",
      (member.industry || []).join(", "),
      member.businessEmail || "",
      member.businessPhone || "",
      member.city || "",
      member.state || "",
      member.membershipTier || "",
      member.membershipStatus,
      member.user.role,
      member.joinedAt.toISOString().split("T")[0],
      member.user.lastLogin ? member.user.lastLogin.toISOString().split("T")[0] : "",
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="basa-members-${new Date().toISOString().split("T")[0]}.csv"`
    )

    return response
  } catch (error) {
    console.error("Error exporting members:", error)
    return NextResponse.json(
      { error: "Failed to export members" },
      { status: 500 }
    )
  }
} 