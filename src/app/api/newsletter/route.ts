import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sendNewsletter, sendBulkEmail } from "@/lib/email"
import { getSystemUser } from "@/lib/system-user"

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  preferences: z.array(z.string()).optional(),
  source: z.string().optional()
})

const bulkNewsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  segment: z.enum(["all", "active", "new", "premium"]).optional().default("all")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is a bulk newsletter or individual subscription
    if (body.subject && body.content) {
      // Bulk newsletter
      const { subject, content, segment } = bulkNewsletterSchema.parse(body)
      
      // Get recipients based on segment
      let recipients: Array<{ email: string; firstName: string }> = []
      
      switch (segment) {
        case "all":
          const allMembers = await prisma.member.findMany({
            where: { 
              newsletterSubscribed: true,
              user: {
                email: { not: null }
              }
            },
            include: {
              user: {
                select: { email: true, firstName: true }
              }
            }
          })
          recipients = allMembers
            .filter(member => member.user?.email !== null)
            .map(member => ({ 
              email: member.user!.email!, 
              firstName: member.user!.firstName || 'User' 
            }))
          break
        case "active":
          const activeMembers = await prisma.member.findMany({
            where: { 
              newsletterSubscribed: true,
              user: {
                email: { not: null },
                lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
              }
            },
            include: {
              user: {
                select: { email: true, firstName: true }
              }
            }
          })
          recipients = activeMembers
            .filter(member => member.user?.email !== null)
            .map(member => ({ 
              email: member.user!.email!, 
              firstName: member.user!.firstName || 'User' 
            }))
          break
        case "new":
          const newMembers = await prisma.member.findMany({
            where: { 
              newsletterSubscribed: true,
              user: {
                email: { not: null },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
              }
            },
            include: {
              user: {
                select: { email: true, firstName: true }
              }
            }
          })
          recipients = newMembers
            .filter(member => member.user?.email !== null)
            .map(member => ({ 
              email: member.user!.email!, 
              firstName: member.user!.firstName || 'User' 
            }))
          break
        case "premium":
          const premiumMembers = await prisma.member.findMany({
            where: { 
              newsletterSubscribed: true,
              membershipTier: { in: ["PREMIUM", "VIP"] },
              user: {
                email: { not: null }
              }
            },
            include: {
              user: {
                select: { email: true, firstName: true }
              }
            }
          })
          recipients = premiumMembers
            .filter(member => member.user?.email !== null)
            .map(member => ({ 
              email: member.user!.email!, 
              firstName: member.user!.firstName || 'User' 
            }))
          break
      }
      
      // Send bulk email
      const results = await sendBulkEmail(recipients, subject, content)
      
      // Get system user for audit log
      const systemUser = await getSystemUser()
      
      // Log newsletter send
      await prisma.auditLog.create({
        data: {
          userId: systemUser.id,
          action: "NEWSLETTER_SENT",
          entityType: "NEWSLETTER",
          entityId: "bulk",
          newValues: {
            subject,
            recipientCount: recipients.length,
            segment,
            timestamp: new Date().toISOString()
          }
        }
      })
      
      return NextResponse.json({
        success: true,
        message: `Newsletter sent to ${recipients.length} recipients`,
        results
      })
      
    } else {
      // Individual subscription
      const { email, firstName, lastName, preferences, source } = newsletterSchema.parse(body)
      
      // Check if already subscribed
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { member: true }
      })
      
      if (existingUser?.member?.newsletterSubscribed) {
        return NextResponse.json(
          { error: "Email is already subscribed to the newsletter" },
          { status: 400 }
        )
      }
      
      // Create or update user and member subscription
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          firstName: firstName || existingUser?.firstName,
          lastName: lastName || existingUser?.lastName,
          member: {
            upsert: {
              create: {
                newsletterSubscribed: true,
                membershipStatus: "PENDING"
              },
              update: {
                newsletterSubscribed: true
              }
            }
          }
        },
        create: {
          email,
          firstName,
          lastName,
          role: "MEMBER",
          isActive: true,
          member: {
            create: {
              newsletterSubscribed: true,
              membershipStatus: "PENDING"
            }
          }
        },
        include: { member: true }
      })
      
      // Send welcome newsletter email
      try {
        const welcomeContent = `
          <h2>Welcome to the BASA Newsletter!</h2>
          <p>Thank you for subscribing to our newsletter, ${firstName}. You'll now receive updates about:</p>
          <ul>
            <li>Upcoming events and networking opportunities</li>
            <li>Member spotlights and success stories</li>
            <li>Business resources and industry insights</li>
            <li>Exclusive member benefits and offers</li>
          </ul>
          <p>Stay tuned for our next newsletter!</p>
        `
        await sendNewsletter(email, firstName, welcomeContent)
      } catch (emailError) {
        console.error("Failed to send welcome newsletter email:", emailError)
        // Don't fail the subscription if email fails
      }
      
      // Get system user for audit log
      const systemUser = await getSystemUser()
      
      // Log subscription
      await prisma.auditLog.create({
        data: {
          userId: systemUser.id,
          action: "NEWSLETTER_SUBSCRIPTION_CREATED",
          entityType: "USER",
          entityId: user.id,
          newValues: {
            email,
            firstName,
            lastName,
            source,
            timestamp: new Date().toISOString()
          }
        }
      })
      
      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to newsletter"
      })
    }
    
  } catch (error: any) {
    console.error("Newsletter error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      )
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