import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // CSV template with headers and example data
    const csvContent = `firstName,lastName,email,password,businessName,businessType,industry,businessEmail,businessPhone,businessAddress,city,state,zipCode,website,membershipTier,role
John,Doe,john.doe@example.com,password123,Acme Corp,Technology,"Technology, Software",john@acme.com,555-0123,123 Main St,San Antonio,TX,78201,https://acme.com,PREMIUM,MEMBER
Jane,Smith,jane.smith@example.com,password123,Smith Consulting,Consulting,"Consulting, Business",jane@smithconsulting.com,555-0124,456 Oak Ave,San Antonio,TX,78202,https://smithconsulting.com,BASIC,MEMBER
Mike,Johnson,mike@techstartup.com,password123,Tech Startup,Technology,"Technology, Startup",mike@techstartup.com,555-0125,789 Innovation Blvd,San Antonio,TX,78203,https://techstartup.com,VIP,MEMBER`

    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="basa-members-template-${new Date().toISOString().split("T")[0]}.csv"`
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