import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  // User fields
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  
  // Member fields
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.array(z.string()).optional(),
  businessEmail: z.string().email("Invalid business email").optional().or(z.literal("")),
  businessPhone: z.string().optional(),
  personalPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Invalid website URL"
  }),
  description: z.string().optional(),
  tagline: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  linkedin: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Invalid LinkedIn URL"
  }),
  facebook: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Invalid Facebook URL"
  }),
  instagram: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Invalid Instagram URL"
  }),
  twitter: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Invalid Twitter URL"
  }),
  youtube: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Invalid YouTube URL"
  }),
  showInDirectory: z.boolean().optional(),
  allowContact: z.boolean().optional(),
  showAddress: z.boolean().optional(),
}).transform((data) => {
  // Convert empty strings to undefined for optional fields
  const transformed = { ...data }
  const urlFields = ['website', 'linkedin', 'facebook', 'instagram', 'twitter', 'youtube']
  const emailFields = ['businessEmail']
  
  urlFields.forEach(field => {
    if (transformed[field as keyof typeof transformed] === '') {
      transformed[field as keyof typeof transformed] = undefined
    }
  })
  
  emailFields.forEach(field => {
    if (transformed[field as keyof typeof transformed] === '') {
      transformed[field as keyof typeof transformed] = undefined
    }
  })
  
  return transformed
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    return NextResponse.json(user)
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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== session.user.email) {
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

    // Update user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user if user fields are provided
      const userUpdateData: any = {}
      if (validatedData.firstName !== undefined) userUpdateData.firstName = validatedData.firstName
      if (validatedData.lastName !== undefined) userUpdateData.lastName = validatedData.lastName
      if (validatedData.email !== undefined) userUpdateData.email = validatedData.email

      let updatedUser: any = session.user
      if (Object.keys(userUpdateData).length > 0) {
        updatedUser = await tx.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        })
      }

      // Update or create member
      const memberUpdateData: any = {}
      if (validatedData.businessName !== undefined) memberUpdateData.businessName = validatedData.businessName
      if (validatedData.businessType !== undefined) memberUpdateData.businessType = validatedData.businessType
      if (validatedData.industry !== undefined) memberUpdateData.industry = validatedData.industry
      if (validatedData.businessEmail !== undefined) memberUpdateData.businessEmail = validatedData.businessEmail
      if (validatedData.businessPhone !== undefined) memberUpdateData.businessPhone = validatedData.businessPhone
      if (validatedData.personalPhone !== undefined) memberUpdateData.businessPhone = validatedData.personalPhone
      if (validatedData.businessAddress !== undefined) memberUpdateData.businessAddress = validatedData.businessAddress
      if (validatedData.city !== undefined) memberUpdateData.city = validatedData.city
      if (validatedData.state !== undefined) memberUpdateData.state = validatedData.state
      if (validatedData.zipCode !== undefined) memberUpdateData.zipCode = validatedData.zipCode
      if (validatedData.website !== undefined) memberUpdateData.website = validatedData.website
      if (validatedData.description !== undefined) memberUpdateData.description = validatedData.description
      if (validatedData.tagline !== undefined) memberUpdateData.tagline = validatedData.tagline
      if (validatedData.specialties !== undefined) memberUpdateData.specialties = validatedData.specialties
      if (validatedData.certifications !== undefined) memberUpdateData.certifications = validatedData.certifications
      if (validatedData.linkedin !== undefined) memberUpdateData.linkedin = validatedData.linkedin
      if (validatedData.facebook !== undefined) memberUpdateData.facebook = validatedData.facebook
      if (validatedData.instagram !== undefined) memberUpdateData.instagram = validatedData.instagram
      if (validatedData.twitter !== undefined) memberUpdateData.twitter = validatedData.twitter
      if (validatedData.youtube !== undefined) memberUpdateData.youtube = validatedData.youtube
      if (validatedData.showInDirectory !== undefined) memberUpdateData.showInDirectory = validatedData.showInDirectory
      if (validatedData.allowContact !== undefined) memberUpdateData.allowContact = validatedData.allowContact
      if (validatedData.showAddress !== undefined) memberUpdateData.showAddress = validatedData.showAddress

      let updatedMember = null
      if (Object.keys(memberUpdateData).length > 0) {
        updatedMember = await tx.member.upsert({
          where: { userId: session.user.id },
          update: memberUpdateData,
          create: {
            userId: session.user.id,
            ...memberUpdateData,
            membershipStatus: "ACTIVE",
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

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating profile:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
} 