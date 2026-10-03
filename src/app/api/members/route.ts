import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { requireSession, isResponse } from "@/lib/api-auth"
import { MEMBERSHIP_TIER_VALUES } from '@/lib/membership-tiers'
import { adminMemberSelect, directoryMemberSelect, applyMemberPrivacy, directoryWhere } from '@/lib/member-privacy'

const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "INACTIVE"]).optional(),
  membershipTier: z.enum(MEMBERSHIP_TIER_VALUES).optional(),
  industry: z.string().optional(),
  city: z.string().trim().min(1).optional(),
  /** `directory`: the member-directory view, even for an admin. */
  scope: z.enum(["directory"]).optional(),
  /** Admin only: `active` = can sign in; `unclaimed` = imported, never claimed. */
  account: z.enum(["active", "unclaimed"]).optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("20"),
  sortBy: z.enum(["firstName", "lastName", "businessName", "joinedAt", "membershipTier"]).default("joinedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    // A GUEST session is someone without an active membership: the directory
    // is a member benefit.
    if (session.user.role === "GUEST") {
      return NextResponse.json({ error: "The member directory is for active members" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const parsed = searchParamsSchema.safeParse(Object.fromEntries(searchParams))
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters", details: parsed.error.errors }, { status: 400 })
    }
    const params = parsed.data

    // Admins get the full staff list unless they ask for the directory view
    // (the member-facing directory page does, so staff see what members see).
    const isAdmin = session.user.role === "ADMIN" && params.scope !== "directory"
    const and: Prisma.MemberWhereInput[] = []

    if (isAdmin) {
      // Staff see every member, including imported people who have not yet
      // claimed their account (inactive logins). `account` narrows it.
      if (params.account === "active") {
        and.push({ user: { isActive: true } })
      } else if (params.account === "unclaimed") {
        and.push({ user: { hashedPassword: null, accountStatus: "INACTIVE" } })
      }
      if (params.status) and.push({ membershipStatus: params.status })
    } else {
      and.push(directoryWhere)
    }

    if (params.search) {
      and.push({
        OR: [
          { user: { firstName: { contains: params.search, mode: "insensitive" } } },
          { user: { lastName: { contains: params.search, mode: "insensitive" } } },
          { businessName: { contains: params.search, mode: "insensitive" } },
          // Searching by address would let a member confirm who owns an email
          // they are not allowed to see; only staff search that way.
          ...(isAdmin
            ? [
                { user: { email: { contains: params.search, mode: "insensitive" as const } } },
                { businessEmail: { contains: params.search, mode: "insensitive" as const } },
              ]
            : []),
        ],
      })
    }

    if (params.membershipTier) and.push({ membershipTier: params.membershipTier })
    if (params.industry) and.push({ industry: { has: params.industry } })
    if (params.city) and.push({ city: { contains: params.city, mode: "insensitive" } })

    const where: Prisma.MemberWhereInput = { AND: and }

    const orderBy: Prisma.MemberOrderByWithRelationInput[] =
      params.sortBy === "firstName" || params.sortBy === "lastName"
        ? [{ user: { [params.sortBy]: params.sortOrder } }, { id: "asc" }]
        : [{ [params.sortBy]: params.sortOrder }, { id: "asc" }]

    const skip = (params.page - 1) * params.limit

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        select: isAdmin ? adminMemberSelect : directoryMemberSelect,
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.member.count({ where }),
    ])

    const totalPages = Math.ceil(total / params.limit)

    return NextResponse.json({
      members: isAdmin
        ? members
        : members.map((m) => applyMemberPrivacy(m, session.user.id)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPrevPage: params.page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}
