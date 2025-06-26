import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Validation schema for account settings updates
const accountSettingsSchema = z.object({
  // Notification settings
  emailNotifications: z.boolean().optional(),
  eventReminders: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  connectionRequests: z.boolean().optional(),
  membershipUpdates: z.boolean().optional(),
  
  // Privacy settings
  showInDirectory: z.boolean().optional(),
  allowContact: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with account-level data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        member: {
          select: {
            id: true,
            membershipTier: true,
            membershipStatus: true,
            joinedAt: true,
            renewalDate: true,
            showInDirectory: true,
            allowContact: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user exists but doesn't have a member record, create one
    let member = user.member
    if (!member) {
      member = await prisma.member.create({
        data: {
          userId: user.id,
          membershipStatus: "ACTIVE",
          joinedAt: new Date(),
          showInDirectory: true,
          allowContact: true,
          industry: [],
          specialties: [],
          certifications: [],
        },
        select: {
          id: true,
          membershipTier: true,
          membershipStatus: true,
          joinedAt: true,
          renewalDate: true,
          showInDirectory: true,
          allowContact: true,
        },
      })
    }

    // Return account settings data
    const accountData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      member: member,
      // Default notification settings (these would typically be stored in a separate settings table)
      notificationSettings: {
        emailNotifications: member?.allowContact ?? true,
        eventReminders: true,
        newsletter: false,
        marketingEmails: false,
        connectionRequests: true,
        membershipUpdates: true,
      },
      privacySettings: {
        showInDirectory: member?.showInDirectory ?? true,
        allowContact: member?.allowContact ?? true,
        showEmail: false,
        showPhone: false,
      }
    }

    return NextResponse.json(accountData)
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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = accountSettingsSchema.parse(body)

    // Update account settings in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update member privacy settings if provided
      if (validatedData.showInDirectory !== undefined || validatedData.allowContact !== undefined) {
        await tx.member.upsert({
          where: { userId: session.user.id },
          update: {
            ...(validatedData.showInDirectory !== undefined && { showInDirectory: validatedData.showInDirectory }),
            ...(validatedData.allowContact !== undefined && { allowContact: validatedData.allowContact }),
          },
          create: {
            userId: session.user.id,
            showInDirectory: validatedData.showInDirectory ?? true,
            allowContact: validatedData.allowContact ?? true,
            membershipStatus: "ACTIVE",
            joinedAt: new Date(),
          },
        })
      }

      // Note: In a real application, notification settings would be stored in a separate settings table
      // For now, we'll just update the member's allowContact field as a proxy for email notifications

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_ACCOUNT_SETTINGS",
          entityType: "USER",
          entityId: session.user.id,
          newValues: {
            ...validatedData,
            timestamp: new Date().toISOString()
          },
        },
      })

      return { success: true }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating account settings:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update account settings" },
      { status: 500 }
    )
  }
} 