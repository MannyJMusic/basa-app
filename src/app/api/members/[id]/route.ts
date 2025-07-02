import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
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
  membershipTier: z.enum(["BASIC", "PREMIUM", "VIP", "MEETING_MEMBER", "ASSOCIATE_MEMBER", "TRIO_MEMBER", "CLASS_RESOURCE_MEMBER", "NAG_RESOURCE_MEMBER", "TRAINING_RESOURCE_MEMBER"]).optional(),
  membershipStatus: z.enum(["PENDING", "ACTIVE", "EXPIRED", "INACTIVE"]).optional(),
  role: z.enum(["MEMBER", "MODERATOR", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    console.log('Fetching member with ID:', id)
    console.log('User role:', session.user.role)

    const member = await prisma.member.findUnique({
      where: { id },
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
            updatedAt: true,
          },
        },
        eventRegistrations: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                status: true,
              },
            },
          },
          orderBy: { id: "desc" },
          take: 10,
        },
        eventSponsors: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
              },
            },
          },
          orderBy: { id: "desc" },
          take: 10,
        },
      },
    })

    console.log('Member found:', member ? 'Yes' : 'No')
    if (member) {
      console.log('Member showInDirectory:', member.showInDirectory)
      console.log('User role:', session.user.role)
    }

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // For non-admins, only allow viewing if showInDirectory is true
    if (session.user.role !== "ADMIN" && !member.showInDirectory) {
      console.log('Access denied: member not in directory')
      return NextResponse.json({ error: "Not allowed" }, { status: 403 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json(
      { error: "Failed to fetch member" },
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
    const validatedData = updateMemberSchema.parse(body)

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingMember.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        )
      }
    }

    // Update member and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user if user fields are provided
      if (validatedData.firstName || validatedData.lastName || validatedData.email || validatedData.role || validatedData.isActive !== undefined) {
        await tx.user.update({
          where: { id: existingMember.userId },
          data: {
            ...(validatedData.firstName && { firstName: validatedData.firstName }),
            ...(validatedData.lastName && { lastName: validatedData.lastName }),
            ...(validatedData.email && { email: validatedData.email }),
            ...(validatedData.role && { role: validatedData.role }),
            ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
          },
        })
      }

      // Update member
      const updatedMember = await tx.member.update({
        where: { id },
        data: {
          ...(validatedData.businessName !== undefined && { businessName: validatedData.businessName }),
          ...(validatedData.businessType !== undefined && { businessType: validatedData.businessType }),
          ...(validatedData.industry !== undefined && { industry: validatedData.industry }),
          ...(validatedData.businessEmail !== undefined && { businessEmail: validatedData.businessEmail }),
          ...(validatedData.businessPhone !== undefined && { businessPhone: validatedData.businessPhone }),
          ...(validatedData.businessAddress !== undefined && { businessAddress: validatedData.businessAddress }),
          ...(validatedData.city !== undefined && { city: validatedData.city }),
          ...(validatedData.state !== undefined && { state: validatedData.state }),
          ...(validatedData.zipCode !== undefined && { zipCode: validatedData.zipCode }),
          ...(validatedData.website !== undefined && { website: validatedData.website }),
          ...(validatedData.membershipTier !== undefined && { membershipTier: validatedData.membershipTier }),
          ...(validatedData.membershipStatus !== undefined && { membershipStatus: validatedData.membershipStatus }),
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
              lastLogin: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_MEMBER",
          entityType: "MEMBER",
          entityId: id,
          oldValues: {
            memberId: existingMember.id,
            userEmail: existingMember.user.email,
            businessName: existingMember.businessName,
            membershipTier: existingMember.membershipTier,
            membershipStatus: existingMember.membershipStatus,
          },
          newValues: {
            memberId: updatedMember.id,
            userEmail: updatedMember.user?.email,
            businessName: updatedMember.businessName,
            membershipTier: updatedMember.membershipTier,
            membershipStatus: updatedMember.membershipStatus,
          },
        },
      })

      return updatedMember
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating member:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update member" },
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

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Soft delete by deactivating the user
    await prisma.$transaction(async (tx) => {
      // Deactivate user
      await tx.user.update({
        where: { id: existingMember.userId },
        data: { isActive: false },
      })

      // Update member status to inactive
      await tx.member.update({
        where: { id },
        data: { membershipStatus: "INACTIVE" },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_MEMBER",
          entityType: "MEMBER",
          entityId: id,
          oldValues: {
            memberId: existingMember.id,
            userEmail: existingMember.user.email,
            businessName: existingMember.businessName,
            isActive: true,
          },
          newValues: {
            memberId: existingMember.id,
            isActive: false,
            membershipStatus: "INACTIVE",
          },
        },
      })
    })

    return NextResponse.json({ message: "Member deleted successfully" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    )
  }
} 