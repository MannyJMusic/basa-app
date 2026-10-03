import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { requireSession, isResponse } from "@/lib/api-auth"
import { requestEmailChange, EmailChangeError } from "@/lib/email-change"
import { withoutSecrets } from "@/lib/user-safe"
import { optionalEmail, optionalText, optionalUrl } from "@/lib/optional-fields"

// Validation schema for profile updates. Optional text fields accept "" or
// null to clear them (stored as null); web addresses may omit the scheme.
const profileUpdateSchema = z.object({
  // User fields
  firstName: z.string().trim().min(1, "First name is required").max(100).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(100).optional(),
  email: z.string().trim().email("Invalid email address").optional(),

  // Member fields
  businessName: optionalText(200),
  businessType: optionalText(200),
  industry: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  businessEmail: optionalEmail(),
  businessPhone: optionalText(50),
  businessAddress: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  zipCode: optionalText(20),
  website: optionalUrl(),
  description: optionalText(5000),
  tagline: optionalText(300),
  specialties: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  certifications: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  linkedin: optionalUrl(),
  facebook: optionalUrl(),
  instagram: optionalUrl(),
  twitter: optionalUrl(),
  youtube: optionalUrl(),
  showInDirectory: z.boolean().optional(),
  allowContact: z.boolean().optional(),
  showAddress: z.boolean().optional(),
})

const MEMBER_FIELDS = [
  "businessName", "businessType", "industry", "businessEmail", "businessPhone",
  "businessAddress", "city", "state", "zipCode", "website", "description", "tagline",
  "specialties", "certifications", "linkedin", "facebook", "instagram", "twitter",
  "youtube", "showInDirectory", "allowContact", "showAddress",
] as const

/** Zod issues as { field: first message }, for showing next to each input. */
function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.errors) {
    const key = String(issue.path[0] ?? "form")
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    // Get user with member data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        member: {
          include: {
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
            referralsGiven: {
              include: {
                referred: {
                  select: {
                    id: true,
                    businessName: true,
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
              take: 10,
            },
            referralsReceived: {
              include: {
                referrer: {
                  select: {
                    id: true,
                    businessName: true,
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
              take: 10,
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // For guests, return minimal user info if no member record
    if (user.role === "GUEST" && !user.member) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        member: null
      })
    }

    // Never the credentials: the profile used to return the whole row, which would
    // also hand the signed-in user the email-change token and so let them confirm a
    // change without the new inbox.
    return NextResponse.json(withoutSecrets(user))
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // A new email address is never written here (2026-09-22 audit, M-A8): it
    // becomes pending, and changes only when the link sent to it is used.
    let emailChangePending: string | null = null
    if (validatedData.email && validatedData.email.trim().toLowerCase() !== (session.user.email ?? "").toLowerCase()) {
      try {
        emailChangePending = await requestEmailChange(session.user.id, validatedData.email)
      } catch (error) {
        if (error instanceof EmailChangeError) {
          return NextResponse.json({ error: error.message }, { status: error.status })
        }
        throw error
      }
    }

    // Update user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user if user fields are provided
      const userUpdateData: any = {}
      if (validatedData.firstName !== undefined) userUpdateData.firstName = validatedData.firstName
      if (validatedData.lastName !== undefined) userUpdateData.lastName = validatedData.lastName

      let updatedUser: any = session.user
      if (Object.keys(userUpdateData).length > 0) {
        updatedUser = await tx.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        })
      }

      const memberUpdateData: Record<string, unknown> = {}
      for (const key of MEMBER_FIELDS) {
        if (validatedData[key] !== undefined) memberUpdateData[key] = validatedData[key]
      }

      let updatedMember = null
      if (Object.keys(memberUpdateData).length > 0) {
        updatedMember = await tx.member.upsert({
          where: { userId: session.user.id },
          update: memberUpdateData,
          create: {
            userId: session.user.id,
            // Private until the member says otherwise.
            showInDirectory: false,
            allowContact: false,
            ...memberUpdateData,
            // Never self-activate (#166); ACTIVE comes from the office or a payment.
            membershipStatus: "PENDING",
            joinedAt: new Date(),
          },
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_PROFILE",
          entityType: "USER",
          entityId: session.user.id,
          newValues: {
            ...userUpdateData,
            ...memberUpdateData,
          },
        },
      })

      return { user: updatedUser, member: updatedMember }
    })

    return NextResponse.json({ ...result, user: withoutSecrets(result.user), emailChangePending })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields", details: error.errors, fieldErrors: fieldErrorsOf(error) },
        { status: 400 }
      )
    }
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
} 