import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sendNewsletter } from "@/lib/basa-emails"
import { getSystemUser } from "@/lib/system-user"
import { requireSession, isResponse } from "@/lib/api-auth"

/**
 * POST: subscribe an address to the newsletter. Public.
 *
 * The bulk-send branch that used to share this handler is now
 * /api/admin/newsletter (admin only). Subscribing never creates a login-capable
 * account and never edits an existing user's name (#166): unknown addresses get
 * an inactive GUEST row that exists only to hang the Member.newsletterSubscribed
 * flag on. Self-registration is not offered on this site.
 */
const newsletterSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    preferences: z.array(z.string().max(50)).max(20).optional(),
    source: z.string().max(100).optional(),
  })
  .strict()

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, source } = newsletterSchema.parse(await request.json())

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { member: { select: { id: true, newsletterSubscribed: true } } },
    })

    if (existingUser?.member?.newsletterSubscribed) {
      return NextResponse.json(
        { error: "Email is already subscribed to the newsletter" },
        { status: 400 }
      )
    }

    let userId: string
    if (existingUser) {
      userId = existingUser.id
      if (existingUser.member) {
        await prisma.member.update({
          where: { id: existingUser.member.id },
          data: { newsletterSubscribed: true },
        })
      } else {
        await prisma.member.create({
          data: { userId, newsletterSubscribed: true, membershipStatus: "PENDING" },
        })
      }
    } else {
      const created = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role: "GUEST",
          isActive: false,
          accountStatus: "INACTIVE",
          member: { create: { newsletterSubscribed: true, membershipStatus: "PENDING" } },
        },
        select: { id: true },
      })
      userId = created.id
    }

    const greetingName = existingUser?.firstName || firstName

    try {
      const welcomeContent = `
          <h2>Welcome to the BASA Newsletter!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates about:</p>
          <ul>
            <li>Upcoming events and networking opportunities</li>
            <li>Member spotlights and success stories</li>
            <li>Business resources and industry insights</li>
            <li>Exclusive member benefits and offers</li>
          </ul>
          <p>Stay tuned for our next newsletter!</p>
        `
      await sendNewsletter(email, greetingName, welcomeContent)
    } catch (emailError) {
      console.error("Failed to send welcome newsletter email:", emailError)
    }

    const systemUser = await getSystemUser()
    await prisma.auditLog.create({
      data: {
        userId: systemUser.id,
        action: "NEWSLETTER_SUBSCRIPTION_CREATED",
        entityType: "USER",
        entityId: userId,
        newValues: { email, source, timestamp: new Date().toISOString() },
      },
    })

    return NextResponse.json({ success: true, message: "Successfully subscribed to newsletter" })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Newsletter error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') ?? session.user.email
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      )
    }

    // Members may only unsubscribe themselves; admins may unsubscribe anyone
    if (email !== session.user.email && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Unsubscribe from newsletter
    const user = await prisma.user.findUnique({
      where: { email },
      include: { member: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    if (user.member) {
      await prisma.member.update({
        where: { id: user.member.id },
        data: { newsletterSubscribed: false }
      })
    }
    
    // Get system user for audit log
    const systemUser = await getSystemUser()
    
    // Log unsubscription
    await prisma.auditLog.create({
      data: {
        userId: systemUser.id,
        action: "NEWSLETTER_UNSUBSCRIBED",
        entityType: "USER",
        entityId: user.id,
        newValues: {
          email,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter"
    })
    
  } catch (error: any) {
    console.error("Newsletter unsubscribe error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 