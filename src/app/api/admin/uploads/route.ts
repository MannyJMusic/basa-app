import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { FLYER_MAX_BYTES } from "@/lib/flyer-draft"
import { storeImage, UPLOAD_IMAGE_TYPES, type UploadKind } from "@/lib/uploads"

/**
 * POST /api/admin/uploads  (multipart: `file`, `kind` = events | venues)
 * Stores an image (and its thumbnail) for an event or venue and returns the URLs.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  const kind = form?.get("kind")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file was uploaded" }, { status: 400 })
  if (kind !== "events" && kind !== "venues") return NextResponse.json({ error: "kind must be events or venues" }, { status: 400 })
  if (!UPLOAD_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported file type ${file.type || "(unknown)"}. Use JPG, PNG, GIF or WebP` }, { status: 415 })
  }
  if (file.size === 0 || file.size > FLYER_MAX_BYTES) {
    return NextResponse.json({ error: `Images must be between 1 byte and ${FLYER_MAX_BYTES / 1024 / 1024} MB` }, { status: 413 })
  }

  const stored = await storeImage(Buffer.from(await file.arrayBuffer()), file.name, file.type, kind as UploadKind, request.url)
  if (!stored) return NextResponse.json({ error: "The image could not be stored" }, { status: 500 })
  return NextResponse.json(stored)
}
