import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { MEMBERSHIP_TIER_VALUES, tierLabel } from '@/lib/membership-tiers'
import { csvCell } from '@/lib/csv'

const exportParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "INACTIVE"]).optional(),
  account: z.enum(["active", "unclaimed"]).optional(),
  membershipTier: z.enum(MEMBERSHIP_TIER_VALUES).optional(),
  industry: z.string().optional(),
  format: z.enum(["csv", "json"]).default("csv"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const { searchParams } = new URL(request.url)
    const params = exportParamsSchema.parse(Object.fromEntries(searchParams))

    // Staff export everyone, including imported members who have not yet
    // claimed their login; `account` narrows it like the admin list does.
    const where: any = {}
    if (params.account === "active") {
      where.user = { isActive: true }
    } else if (params.account === "unclaimed") {
      where.user = { hashedPassword: null, accountStatus: "INACTIVE" }
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
            accountStatus: true,
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
      "Login Active",
      "Joined Date",
      "Renewal Date",
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
      member.membershipTier ? tierLabel(member.membershipTier) : "",
      member.membershipStatus,
      member.user.role,
      member.user.isActive ? "yes" : "no",
      member.joinedAt.toISOString().split("T")[0],
      member.renewalDate ? member.renewalDate.toISOString().split("T")[0] : "",
      member.user.lastLogin ? member.user.lastLogin.toISOString().split("T")[0] : "",
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map(csvCell).join(",")),
    ].join("\n")

    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="basa-members-${new Date().toISOString().split("T")[0]}.csv"`
    )

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid filters", details: error.errors }, { status: 400 })
    }
    console.error("Error exporting members:", error)
    return NextResponse.json(
      { error: "Failed to export members" },
      { status: 500 }
    )
  }
} 