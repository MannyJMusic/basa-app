import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sendBulkEmail } from "@/lib/basa-emails"
import { sanitizeRichText } from "@/lib/sanitize-html"
import { requireAdmin, isResponse } from "@/lib/api-auth"

/**
 * POST /api/admin/newsletter — send a newsletter to a member segment.
 *
 * Admin only. This used to live on the public /api/newsletter handler, where any
 * anonymous request with a subject and content mailed every subscribed member
 * from BASA's authenticated Mailgun domain (2026-09-22 audit, #166).
 */
const bulkNewsletterSchema = z
  .object({
    subject: z.string().trim().min(1, "Subject is required").max(200),
    content: z.string().min(1, "Content is required").max(200_000),
    segment: z.enum(["all", "active", "new", "premium"]).default("all"),
  })
  .strict()

const DAY = 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  try {
    const { subject, content, segment } = bulkNewsletterSchema.parse(await request.json())

    const userFilter: Record<string, unknown> = { email: { not: null } }
    if (segment === "active") userFilter.lastLogin = { gte: new Date(Date.now() - 30 * DAY) }
    if (segment === "new") userFilter.createdAt = { gte: new Date(Date.now() - 7 * DAY) }

    const members = await prisma.member.findMany({
      where: {
        newsletterSubscribed: true,
        ...(segment === "premium" ? { membershipTier: { in: ["ASSOCIATE_MEMBER", "TRIO_MEMBER"] } } : {}),
        user: userFilter,
      },
      select: { user: { select: { email: true, firstName: true } } },
    })

    const recipients = members
      .filter((m) => m.user?.email)
      .map((m) => ({ email: m.user!.email!, firstName: m.user!.firstName || "there" }))

    // Rich text from the admin editor; strip anything outside the allowlist so a
    // pasted payload cannot ride BASA's signed mail into every member's inbox.
    const safeContent = sanitizeRichText(content)

    const results = await sendBulkEmail(recipients, subject, safeContent)
    const failed = results.filter((r) => !r.success).length

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "NEWSLETTER_SENT",
        entityType: "NEWSLETTER",
        entityId: "bulk",
        newValues: {
          subject,
          segment,
          recipientCount: recipients.length,
          failed,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${recipients.length - failed} of ${recipients.length} recipients`,
      recipientCount: recipients.length,
      failed,
    })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Admin newsletter error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
