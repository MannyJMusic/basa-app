import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { parse } from "csv-parse/sync"

// Validation schema for CSV row
const csvRowSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().url().optional(),
  membershipTier: z.enum(["BASIC", "PREMIUM", "VIP"]).optional(),
  role: z.enum(["MEMBER", "MODERATOR", "ADMIN"]).optional(),
})

// Expected CSV headers
const expectedHeaders = [
  "firstName",
  "lastName", 
  "email",
  "password",
  "businessName",
  "businessType",
  "industry",
  "businessEmail",
  "businessPhone",
  "businessAddress",
  "city",
  "state",
  "zipCode",
  "website",
  "membershipTier",
  "role"
]

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const fileContent = await file.text()
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    if (records.length > 1000) {
      return NextResponse.json({ error: "Maximum 1000 members can be uploaded at once" }, { status: 400 })
    }

    // Validate headers
    const headers = Object.keys(records[0])
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(", ")}` 
      }, { status: 400 })
    }

    const results = {
      total: records.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{ row: number; email: string; error: string }>,
      createdMembers: [] as Array<{ email: string; businessName?: string }>,
      updatedMembers: [] as Array<{ email: string; businessName?: string }>
    }

    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const rowNumber = i + 2 // +2 because CSV is 1-indexed and has headers

      try {
        // Validate row data
        const validatedData = csvRowSchema.parse(row)

        // Parse industry as array if provided
        const industry = validatedData.industry 
          ? validatedData.industry.split(",").map(i => i.trim()).filter(Boolean)
          : []

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
          include: { member: true }
        })

        if (existingUser) {
          // Update existing user and member
          const result = await prisma.$transaction(async (tx) => {
            // Update user data
            const updatedUser = await tx.user.update({
              where: { id: existingUser.id },
              data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: validatedData.role || existingUser.role,
                // Only update password if provided
                ...(validatedData.password && {
                  hashedPassword: await (await import("bcryptjs")).hash(validatedData.password, 12)
                })
              },
            })

            // Update or create member data
            const updatedMember = await tx.member.upsert({
              where: { userId: existingUser.id },
              update: {
                businessName: validatedData.businessName,
                businessType: validatedData.businessType,
                industry,
                businessEmail: validatedData.businessEmail,
                businessPhone: validatedData.businessPhone,
                businessAddress: validatedData.businessAddress,
                city: validatedData.city,
                state: validatedData.state,
                zipCode: validatedData.zipCode,
                website: validatedData.website,
                membershipTier: validatedData.membershipTier || "BASIC",
              },
              create: {
                userId: existingUser.id,
                businessName: validatedData.businessName,
                businessType: validatedData.businessType,
                industry,
                businessEmail: validatedData.businessEmail,
                businessPhone: validatedData.businessPhone,
                businessAddress: validatedData.businessAddress,
                city: validatedData.city,
                state: validatedData.state,
                zipCode: validatedData.zipCode,
                website: validatedData.website,
                membershipTier: validatedData.membershipTier || "BASIC",
                membershipStatus: "ACTIVE",
                joinedAt: new Date(),
              },
            })

            // Create audit log for update
            await tx.auditLog.create({
              data: {
                userId: session.user.id,
                action: "BULK_UPDATE_MEMBER",
                entityType: "MEMBER",
                entityId: updatedMember.id,
                oldValues: {
                  memberId: updatedMember.id,
                  userEmail: existingUser.email,
                  businessName: existingUser.member?.businessName,
                  membershipTier: existingUser.member?.membershipTier,
                },
                newValues: {
                  memberId: updatedMember.id,
                  userEmail: updatedUser.email,
                  businessName: updatedMember.businessName,
                  membershipTier: updatedMember.membershipTier,
                  bulkUpload: true,
                },
              },
            })

            return { user: updatedUser, member: updatedMember }
          })

          results.updated++
          results.updatedMembers.push({
            email: result.user.email!,
            businessName: result.member.businessName || undefined
          })

        } else {
          // Create new user and member
          const password = validatedData.password || generateRandomPassword()

          // Hash password
          const bcrypt = await import("bcryptjs")
          const hashedPassword = await bcrypt.hash(password, 12)

          // Create user and member in a transaction
          const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
              data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                hashedPassword,
                role: validatedData.role || "MEMBER",
                isActive: true,
              },
            })

            // Create member
            const member = await tx.member.create({
              data: {
                userId: user.id,
                businessName: validatedData.businessName,
                businessType: validatedData.businessType,
                industry,
                businessEmail: validatedData.businessEmail,
                businessPhone: validatedData.businessPhone,
                businessAddress: validatedData.businessAddress,
                city: validatedData.city,
                state: validatedData.state,
                zipCode: validatedData.zipCode,
                website: validatedData.website,
                membershipTier: validatedData.membershipTier || "BASIC",
                membershipStatus: "ACTIVE",
                joinedAt: new Date(),
              },
            })

            // Create audit log for creation
            await tx.auditLog.create({
              data: {
                userId: session.user.id,
                action: "BULK_CREATE_MEMBER",
                entityType: "MEMBER",
                entityId: member.id,
                newValues: {
                  memberId: member.id,
                  userEmail: user.email,
                  businessName: member.businessName,
                  membershipTier: member.membershipTier,
                  bulkUpload: true,
                },
              },
            })

            return { user, member }
          })

          results.created++
          results.createdMembers.push({
            email: result.user.email!,
            businessName: result.member.businessName || undefined
          })
        }

      } catch (error) {
        results.failed++
        const errorMessage = error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(", ")
          : error instanceof Error 
            ? error.message 
            : "Unknown error"
        
        results.errors.push({
          row: rowNumber,
          email: row.email || "Unknown",
          error: errorMessage
        })
      }
    }

    return NextResponse.json({
      message: "Bulk upload completed",
      results
    })

  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    )
  }
}

// Helper function to generate random password
function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
} 