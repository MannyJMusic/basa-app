import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { sendEmailVerification } from "@/lib/email"
import { generateVerificationToken } from "@/lib/utils"

// Validation schemas
const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.array(z.string()).optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().url().optional(),
  membershipTier: z.enum(["BASIC", "PREMIUM", "VIP"]).optional(),
  role: z.enum(["MEMBER", "MODERATOR", "ADMIN"]).default("MEMBER"),
  membershipPaymentConfirmed: z.boolean().optional(),
})

const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  membershipTier: z.enum(["BASIC", "PREMIUM", "VIP"]).optional(),
  industry: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  sortBy: z.enum(["firstName", "lastName", "businessName", "joinedAt", "membershipTier"]).default("joinedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams))

    // Build where clause for filtering
    const where: any = {
      user: {
        isActive: true,
      },
    }

    // For non-admin users, only show members who have opted to be in directory
    if (session.user.role !== "ADMIN") {
      where.showInDirectory = true
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

    // Build order by clause
    const orderBy: any = {}
    if (params.sortBy === "firstName" || params.sortBy === "lastName") {
      orderBy.user = { [params.sortBy]: params.sortOrder }
    } else if (params.sortBy === "businessName") {
      orderBy[params.sortBy] = params.sortOrder
    } else {
      orderBy[params.sortBy] = params.sortOrder
    }

    // Calculate pagination
    const skip = (params.page - 1) * params.limit

    // Get members with pagination
    const [members, total] = await Promise.all([
      prisma.member.findMany({
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
          eventRegistrations: {
            select: {
              id: true,
              event: {
                select: {
                  id: true,
                  title: true,
                  startDate: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.member.count({ where }),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / params.limit)
    const hasNextPage = params.page < totalPages
    const hasPrevPage = params.page > 1

    return NextResponse.json({
      members,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMemberSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Email verification logic
    let dbVerificationToken: string | null = null
    let dbVerificationTokenExpiry: Date | null = null
    let dbAccountStatus: "PENDING_VERIFICATION" | "ACTIVE" = "PENDING_VERIFICATION"
    let isActive = false
    if (validatedData.membershipPaymentConfirmed) {
      dbVerificationToken = generateVerificationToken()
      dbVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    // Create user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          hashedPassword,
          role: validatedData.role,
          isActive,
          verificationToken: dbVerificationToken,
          verificationTokenExpiry: dbVerificationTokenExpiry,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          verificationToken: true,
        }
      })

      // Create member
      const member = await tx.member.create({
        data: {
          userId: user.id,
          businessName: validatedData.businessName,
          businessType: validatedData.businessType,
          industry: validatedData.industry || [],
          businessEmail: validatedData.businessEmail,
          businessPhone: validatedData.businessPhone,
          businessAddress: validatedData.businessAddress,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          website: validatedData.website,
          membershipTier: validatedData.membershipTier,
          membershipStatus: "ACTIVE",
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_MEMBER",
          entityType: "MEMBER",
          entityId: member.id,
          newValues: {
            memberId: member.id,
            userEmail: user.email,
            businessName: member.businessName,
            membershipTier: member.membershipTier,
          },
        },
      })

      return { user, member }
    })

    const { email, firstName, verificationToken } = result.user;

    // Send verification email if payment is confirmed
    if (validatedData.membershipPaymentConfirmed && verificationToken && firstName && email) {
      try {
        await sendEmailVerification(email, firstName, verificationToken)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
      }
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
} 