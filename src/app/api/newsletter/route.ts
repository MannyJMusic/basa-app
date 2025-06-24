import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sendNewsletter, sendBulkEmail } from "@/lib/email"

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
          recipients = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true 
            },
            select: { email: true, firstName: true }
          })
          break
        case "active":
          recipients = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            },
            select: { email: true, firstName: true }
          })
          break
        case "new":
          recipients = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            },
            select: { email: true, firstName: true }
          })
          break
        case "premium":
          recipients = await prisma.user.findMany({
            where: { 
              isActive: true,
              newsletterSubscribed: true,
              member: {
                tier: { in: ["professional", "corporate"] }
              }
            },
            select: { email: true, firstName: true }
          })
          break
      }
      
      // Send bulk email
      const results = await sendBulkEmail(recipients, subject, content)
      
      // Log newsletter send
      await prisma.auditLog.create({
        data: {
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
      const existingSubscription = await prisma.newsletterSubscription.findUnique({
        where: { email }
      })
      
      if (existingSubscription) {
        return NextResponse.json(
          { error: "Email is already subscribed to the newsletter" },
          { status: 400 }
        )
      }
      
      // Create subscription
      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email,
          firstName,
          lastName,
          preferences: preferences || [],
          source: source || "website",
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
      
      // Log subscription
      await prisma.auditLog.create({
        data: {
          action: "NEWSLETTER_SUBSCRIPTION_CREATED",
          entityType: "NEWSLETTER_SUBSCRIPTION",
          entityId: subscription.id,
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
    await prisma.newsletterSubscription.updateMany({
      where: { email },
      data: { isActive: false }
    })
    
    // Log unsubscription
    await prisma.auditLog.create({
      data: {
        action: "NEWSLETTER_UNSUBSCRIBED",
        entityType: "NEWSLETTER_SUBSCRIPTION",
        entityId: email,
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