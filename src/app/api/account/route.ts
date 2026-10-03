import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { requireSession, isResponse } from "@/lib/api-auth"

/**
 * Account preferences. Only fields that exist on `Member` and that something
 * actually reads are accepted; anything else is rejected rather than silently
 * dropped, so the account page cannot show a toggle that saves nothing.
 */
const accountSettingsSchema = z
  .object({
    newsletterSubscribed: z.boolean().optional(),
    showInDirectory: z.boolean().optional(),
    allowContact: z.boolean().optional(),
    showAddress: z.boolean().optional(),
  })
  .strict()

const memberSelect = {
  id: true,
  membershipTier: true,
  membershipStatus: true,
  joinedAt: true,
  renewalDate: true,
  cancelAtPeriodEnd: true,
  newsletterSubscribed: true,
  showInDirectory: true,
  allowContact: true,
  showAddress: true,
} as const

function preferencesOf(member: {
  newsletterSubscribed: boolean
  showInDirectory: boolean
  allowContact: boolean
  showAddress: boolean
} | null) {
  return {
    newsletterSubscribed: member?.newsletterSubscribed ?? false,
    showInDirectory: member?.showInDirectory ?? false,
    allowContact: member?.allowContact ?? false,
    showAddress: member?.showAddress ?? false,
  }
}

export async function GET() {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    // Read-only: a GET never creates a Member row (#166). A user without one
    // simply has no membership and default (private) preferences.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
        member: { select: memberSelect },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      preferences: preferencesOf(user.member),
    })
  } catch (error) {
    console.error("Error fetching account settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch account settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const body = await request.json()
    const data = accountSettingsSchema.parse(body)

    const member = await prisma.$transaction(async (tx) => {
      // Nothing here may grant a membership. An existing row keeps its status;
      // a user with no row gets a PENDING one that is private by default, so
      // saving a newsletter preference never lists anyone in the directory.
      const updated = await tx.member.upsert({
        where: { userId: session.user.id },
        update: data,
        create: {
          userId: session.user.id,
          membershipStatus: "PENDING",
          showInDirectory: false,
          allowContact: false,
          ...data,
        },
        select: memberSelect,
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_ACCOUNT_SETTINGS",
          entityType: "MEMBER",
          entityId: updated.id,
          newValues: { ...data, timestamp: new Date().toISOString() },
        },
      })

      return updated
    })

    return NextResponse.json({ success: true, preferences: preferencesOf(member), member })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating account settings:", error)
    return NextResponse.json(
      { error: "Failed to update account settings" },
      { status: 500 }
    )
  }
}
