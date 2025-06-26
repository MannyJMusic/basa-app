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
          const allUsers = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              email: { not: null }
            },
            select: { email: true, firstName: true }
          })
          recipients = allUsers
            .filter(user => user.email !== null)
            .map(user => ({ 
              email: user.email!, 
              firstName: user.firstName || 'User' 
            }))
          break
        case "active":
          const activeUsers = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              email: { not: null },
              lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            },
            select: { email: true, firstName: true }
          })
          recipients = activeUsers
            .filter(user => user.email !== null)
            .map(user => ({ 
              email: user.email!, 
              firstName: user.firstName || 'User' 
            }))
          break
        case "new":
          const newUsers = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              email: { not: null },
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            },
            select: { email: true, firstName: true }
          })
          recipients = newUsers
            .filter(user => user.email !== null)
            .map(user => ({ 
              email: user.email!, 
              firstName: user.firstName || 'User' 
            }))
          break
        case "premium":
          const premiumUsers = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              email: { not: null },
              member: {
                membershipTier: { in: ["PREMIUM", "VIP"] }
              }
            },
            select: { email: true, firstName: true }
          })
          recipients = premiumUsers
            .filter(user => user.email !== null)
            .map(user => ({ 
              email: user.email!, 
              firstName: user.firstName || 'User' 
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
        where: { email }
      })
      
      if (existingUser?.newsletterSubscribed) {
        return NextResponse.json(
          { error: "Email is already subscribed to the newsletter" },
          { status: 400 }
        )
      }
      
      // Create or update user subscription
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          newsletterSubscribed: true,
          firstName: firstName || existingUser?.firstName,
          lastName: lastName || existingUser?.lastName
        },
        create: {
          email,
          firstName,
          lastName,
          newsletterSubscribed: true,
          role: "MEMBER",
          isActive: true
        }
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
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    await prisma.user.update({
      where: { email },
      data: { newsletterSubscribed: false }
    })
    
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