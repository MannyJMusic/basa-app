import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { requireAdmin, requireSession, isResponse, USER_ROLES } from "@/lib/api-auth"
import { MEMBERSHIP_TIER_VALUES } from '@/lib/membership-tiers'
import { adminMemberSelect, directoryMemberSelect, applyMemberPrivacy, directoryWhere } from '@/lib/member-privacy'
import { emptyToNull, optionalEmail, optionalText, optionalUrl } from '@/lib/optional-fields'

const updateMemberSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(100).optional(),
  email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
  businessName: optionalText(200),
  businessType: optionalText(200),
  industry: z.array(z.string()).optional(),
  businessEmail: optionalEmail(),
  businessPhone: optionalText(50),
  businessAddress: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  zipCode: optionalText(20),
  website: optionalUrl(),
  membershipTier: z.preprocess(emptyToNull, z.enum(MEMBERSHIP_TIER_VALUES).nullable().optional()),
  membershipStatus: z.enum(["PENDING", "ACTIVE", "EXPIRED", "INACTIVE"]).optional(),
  /** ISO date or date-time; "" or null clears it. */
  renewalDate: z.preprocess(
    emptyToNull,
    z
      .string()
      .refine(v => !Number.isNaN(Date.parse(v)), "Invalid renewal date")
      .transform(v => new Date(v))
      .nullable()
      .optional()
  ),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
})

/** One calendar year from `from`. */
function oneYearFrom(from: Date): Date {
  const d = new Date(from)
  d.setFullYear(d.getFullYear() + 1)
  return d
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    // A GUEST session has no active membership; the directory is for members.
    if (session.user.role === "GUEST") {
      return NextResponse.json({ error: "The member directory is for active members" }, { status: 403 })
    }

    const { id } = await params

    if (session.user.role === "ADMIN") {
      const member = await prisma.member.findUnique({
        where: { id },
        select: {
          ...adminMemberSelect,
          eventSponsors: {
            include: {
              event: { select: { id: true, title: true, startDate: true } },
            },
            orderBy: { id: "desc" },
            take: 10,
          },
        },
      })
      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 })
      }
      return NextResponse.json(member)
    }

    // Non-admins see their own profile, or a member who is listed in the
    // directory, and only what that member agreed to share. Anything else is
    // reported as not found so the endpoint does not confirm who exists.
    const member = await prisma.member.findFirst({
      where: { id, OR: [{ userId: session.user.id }, directoryWhere] },
      select: directoryMemberSelect,
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(applyMemberPrivacy(member, session.user.id))
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
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const { id } = await params
    const body = await request.json()
    const data = updateMemberSchema.parse(body)

    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
        },
      },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // An admin cannot lock themselves out (and leave the site with no admin
    // by accident). Another admin has to do it.
    if (existingMember.userId === session.user.id) {
      if ((data.role !== undefined && data.role !== "ADMIN") || data.isActive === false) {
        return NextResponse.json(
          { error: "You cannot remove your own admin role or deactivate your own account" },
          { status: 400 }
        )
      }
    }

    if (data.email && data.email !== existingMember.user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: data.email } })
      if (emailExists) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }
    }

    // Activating a membership needs a term. Keep a future renewal date (given
    // now or already on the row); otherwise the term runs a year from today.
    let renewalDate = data.renewalDate
    const becomingActive =
      data.membershipStatus === "ACTIVE" && existingMember.membershipStatus !== "ACTIVE"
    if (becomingActive) {
      const now = new Date()
      const effective = renewalDate !== undefined ? renewalDate : existingMember.renewalDate
      if (!effective || effective.getTime() <= now.getTime()) {
        renewalDate = oneYearFrom(now)
      }
    }

    const userData: Prisma.UserUpdateInput = {}
    if (data.firstName !== undefined) userData.firstName = data.firstName
    if (data.lastName !== undefined) userData.lastName = data.lastName
    if (data.email !== undefined) userData.email = data.email
    if (data.role !== undefined) userData.role = data.role
    if (data.isActive !== undefined) userData.isActive = data.isActive

    const memberData: Prisma.MemberUpdateInput = {}
    const memberFields = [
      "businessName", "businessType", "industry", "businessEmail", "businessPhone",
      "businessAddress", "city", "state", "zipCode", "website", "membershipTier",
      "membershipStatus",
    ] as const
    for (const key of memberFields) {
      if (data[key] !== undefined) (memberData as Record<string, unknown>)[key] = data[key]
    }
    if (renewalDate !== undefined) memberData.renewalDate = renewalDate

    const result = await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id: existingMember.userId }, data: userData })
      }

      const updatedMember = await tx.member.update({
        where: { id },
        data: memberData,
        select: adminMemberSelect,
      })

      const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_MEMBER",
          entityType: "MEMBER",
          entityId: id,
          oldValues: {
            memberId: existingMember.id,
            userEmail: existingMember.user.email,
            firstName: existingMember.user.firstName,
            lastName: existingMember.user.lastName,
            role: existingMember.user.role,
            isActive: existingMember.user.isActive,
            businessName: existingMember.businessName,
            membershipTier: existingMember.membershipTier,
            membershipStatus: existingMember.membershipStatus,
            renewalDate: iso(existingMember.renewalDate),
          },
          newValues: {
            memberId: updatedMember.id,
            userEmail: updatedMember.user.email,
            firstName: updatedMember.user.firstName,
            lastName: updatedMember.user.lastName,
            role: updatedMember.user.role,
            isActive: updatedMember.user.isActive,
            businessName: updatedMember.businessName,
            membershipTier: updatedMember.membershipTier,
            membershipStatus: updatedMember.membershipStatus,
            renewalDate: iso(updatedMember.renewalDate),
          },
        },
      })

      return updatedMember
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating member:", error)
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
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const { id } = await params

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (existingMember.userId === session.user.id) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 })
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