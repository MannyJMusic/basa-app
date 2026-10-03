import { NextResponse } from "next/server"
import { requireAdmin, isResponse } from "@/lib/api-auth"

/**
 * The bulk upload template: the header row and one obviously fake example.
 * There is no password or role column; uploaded people are set up through an
 * invitation. membershipTier takes the level name (Meeting, Market, Action,
 * Mixer, Sponsorship) or blank; membershipStatus defaults to ACTIVE, and an
 * ACTIVE row with no renewalDate renews a year from the upload.
 */
const HEADERS = [
  "firstName", "lastName", "email", "businessName", "businessType", "industry",
  "businessEmail", "businessPhone", "businessAddress", "city", "state", "zipCode",
  "website", "membershipTier", "membershipStatus", "renewalDate",
]

const EXAMPLE = [
  "Example", "Person", "example.person@example.com", "Example Business LLC", "Consulting",
  '"Consulting, Marketing"', "info@example.com", "210-555-0100", "100 Example St",
  "San Antonio", "TX", "78205", "example.com", "Meeting", "ACTIVE", "",
]

export async function GET() {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const csvContent = `${HEADERS.join(",")}\n${EXAMPLE.join(",")}\n`

    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="basa-members-template.csv"`
    )

    return response
  } catch (error) {
    console.error("Error generating template:", error)
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    )
  }
}
