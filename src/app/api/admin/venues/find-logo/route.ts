import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { findLogo } from "@/lib/find-logo"
import { storeImage } from "@/lib/uploads"

/** POST { website } -> looks for the venue's logo and stores it. */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const body = await request.json().catch(() => null)
  const website = typeof body?.website === "string" ? body.website.trim() : ""
  let url: URL
  try { url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`) } catch {
    return NextResponse.json({ error: "Enter the venue's website first" }, { status: 400 })
  }
  try {
    const logo = await findLogo(url.toString())
    if (!logo) return NextResponse.json({ error: "No logo was found on that site. Upload one instead." }, { status: 404 })
    const stored = await storeImage(logo.data, url.hostname, logo.type, "venues", request.url)
    if (!stored) return NextResponse.json({ error: "The logo could not be stored" }, { status: 500 })
    return NextResponse.json({ ...stored, from: logo.from })
  } catch (error) {
    return NextResponse.json({ error: `Could not read that site (${error instanceof Error ? error.message : "error"}). Upload a logo instead.` }, { status: 502 })
  }
}
