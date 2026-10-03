import { NextRequest, NextResponse } from "next/server"
import type { MembershipTier, Status } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { parse } from "csv-parse/sync"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { tierFromName, tierFromSlug, MEMBERSHIP_TIER_VALUES } from '@/lib/membership-tiers'
import { emptyToNull, optionalEmail, optionalText, optionalUrl } from '@/lib/optional-fields'

/**
 * Bulk member upload (admin only).
 *
 * New people get an account with no password that cannot sign in yet
 * (`isActive: false`, `INACTIVE`); the invitation flow sets them up. An
 * existing account is never given a new password, role or membership status
 * here: only its member (business) details are filled in, and the result says so.
 */

/** Accepts "Meeting", "Meeting Member", "meeting" or MEETING_MEMBER; blank is null. */
const tierCell = z.preprocess(
  emptyToNull,
  z
    .string()
    .nullable()
    .optional()
    .transform((v, ctx): MembershipTier | null | undefined => {
      if (v === null || v === undefined) return v
      const upper = v.trim().toUpperCase()
      const tier = (MEMBERSHIP_TIER_VALUES as readonly string[]).includes(upper)
        ? (upper as MembershipTier)
        : tierFromSlug(v.trim()) ?? tierFromName(v)
      if (!tier) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown membership level "${v}"` })
        return z.NEVER
      }
      return tier
    })
)

const statusCell = z.preprocess(
  v => (typeof v === "string" ? (v.trim() === "" ? undefined : v.trim().toUpperCase()) : v),
  z.enum(["PENDING", "ACTIVE", "EXPIRED", "INACTIVE"]).optional()
)

const dateCell = z.preprocess(
  emptyToNull,
  z
    .string()
    .refine(v => !Number.isNaN(Date.parse(v)), "Invalid renewal date")
    .transform(v => new Date(v))
    .nullable()
    .optional()
)

const csvRowSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  businessName: optionalText(200),
  businessType: optionalText(200),
  industry: optionalText(500),
  businessEmail: optionalEmail(),
  businessPhone: optionalText(50),
  businessAddress: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  zipCode: optionalText(20),
  website: optionalUrl(),
  membershipTier: tierCell,
  membershipStatus: statusCell,
  renewalDate: dateCell,
})

type CsvRow = z.infer<typeof csvRowSchema>

const REQUIRED_HEADERS = ["firstName", "lastName", "email"]
/** Columns from the old template that are now deliberately ignored. */
const IGNORED_HEADERS = ["password", "role"]

const MEMBER_TEXT_FIELDS = [
  "businessName", "businessType", "businessEmail", "businessPhone", "businessAddress",
  "city", "state", "zipCode", "website", "membershipTier",
] as const

/** Member fields a row sets, skipping blank cells (a blank cell never erases data). */
function memberFieldsFrom(row: CsvRow) {
  const data: {
    [K in (typeof MEMBER_TEXT_FIELDS)[number]]?: NonNullable<CsvRow[K]>
  } & { industry?: string[] } = {}
  for (const key of MEMBER_TEXT_FIELDS) {
    const value = row[key]
    if (value !== null && value !== undefined) (data as Record<string, unknown>)[key] = value
  }
  if (row.industry) {
    data.industry = row.industry.split(",").map(i => i.trim()).filter(Boolean)
  }
  return data
}

function oneYearFromNow(): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const fileContent = await file.text()

    let records: Record<string, string>[]
    try {
      // csv-parse 7 types the sync result as unknown[]; rows are header-keyed strings here.
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }) as Record<string, string>[]
    } catch {
      return NextResponse.json({ error: "Could not read the CSV file" }, { status: 400 })
    }

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    if (records.length > 1000) {
      return NextResponse.json({ error: "Maximum 1000 members can be uploaded at once" }, { status: 400 })
    }

    const headers = Object.keys(records[0])
    const missingHeaders = REQUIRED_HEADERS.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      return NextResponse.json({
        error: `Missing required headers: ${missingHeaders.join(", ")}`
      }, { status: 400 })
    }

    const warnings: string[] = []
    const ignored = IGNORED_HEADERS.filter(h => headers.includes(h))
    if (ignored.length > 0) {
      warnings.push(
        `Ignored column(s): ${ignored.join(", ")}. Passwords and roles are never set by upload; new members are set up through an invitation.`
      )
    }

    const results = {
      total: records.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{ row: number; email: string; error: string }>,
      createdMembers: [] as Array<{ email: string; businessName?: string }>,
      updatedMembers: [] as Array<{ email: string; businessName?: string; note?: string }>,
      warnings,
    }

    for (let i = 0; i < records.length; i++) {
      const raw = records[i]
      const rowNumber = i + 2 // 1-indexed, after the header row

      try {
        const row = csvRowSchema.parse(raw)
        const memberFields = memberFieldsFrom(row)

        const existingUser = await prisma.user.findFirst({
          where: { email: { equals: row.email, mode: "insensitive" } },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            member: { select: { id: true, businessName: true, membershipTier: true } },
          },
        })

        if (existingUser) {
          // Never touch the password, role, status or login state of an
          // existing account; fill in member details only.
          const member = await prisma.$transaction(async (tx) => {
            if (!existingUser.firstName || !existingUser.lastName) {
              await tx.user.update({
                where: { id: existingUser.id },
                data: {
                  ...(!existingUser.firstName && { firstName: row.firstName }),
                  ...(!existingUser.lastName && { lastName: row.lastName }),
                },
              })
            }

            const saved = existingUser.member
              ? await tx.member.update({ where: { id: existingUser.member.id }, data: memberFields })
              : await tx.member.create({
                  data: {
                    ...memberFields,
                    userId: existingUser.id,
                    // An existing login gets no membership from a spreadsheet;
                    // staff activate it on the member page.
                    membershipStatus: "PENDING",
                  },
                })

            await tx.auditLog.create({
              data: {
                userId: session.user.id,
                action: "BULK_UPDATE_MEMBER",
                entityType: "MEMBER",
                entityId: saved.id,
                oldValues: {
                  memberId: existingUser.member?.id ?? null,
                  userEmail: existingUser.email,
                  businessName: existingUser.member?.businessName ?? null,
                  membershipTier: existingUser.member?.membershipTier ?? null,
                },
                newValues: {
                  memberId: saved.id,
                  userEmail: existingUser.email,
                  businessName: saved.businessName,
                  membershipTier: saved.membershipTier,
                  bulkUpload: true,
                },
              },
            })

            return saved
          })

          results.updated++
          results.updatedMembers.push({
            email: existingUser.email ?? row.email,
            businessName: member.businessName || undefined,
            note: existingUser.member
              ? "Existing account: business details updated; password, role and membership status unchanged"
              : "Existing account: member record added as PENDING; password and role unchanged",
          })
        } else {
          const status: Status = row.membershipStatus ?? "ACTIVE"
          const renewalDate =
            row.renewalDate ?? (status === "ACTIVE" ? oneYearFromNow() : null)

          const created = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                hashedPassword: null,
                role: status === "ACTIVE" ? "MEMBER" : "GUEST",
                isActive: false,
                accountStatus: "INACTIVE",
              },
            })

            const member = await tx.member.create({
              data: {
                ...memberFields,
                industry: memberFields.industry ?? [],
                userId: user.id,
                membershipTier: row.membershipTier ?? null,
                membershipStatus: status,
                renewalDate,
                joinedAt: new Date(),
              },
            })

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
                  membershipStatus: member.membershipStatus,
                  bulkUpload: true,
                },
              },
            })

            return { user, member }
          })

          results.created++
          results.createdMembers.push({
            email: created.user.email!,
            businessName: created.member.businessName || undefined,
          })
        }
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof z.ZodError
          ? error.errors.map(e => `${e.path.join(".") || "row"}: ${e.message}`).join("; ")
          : "Could not save this row"
        if (!(error instanceof z.ZodError)) console.error(`Bulk upload row ${rowNumber} failed:`, error)

        results.errors.push({
          row: rowNumber,
          email: raw.email || "Unknown",
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      message: "Bulk upload completed",
      results,
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    )
  }
}
