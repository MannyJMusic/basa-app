import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import * as Sentry from "@sentry/nextjs"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import {
  extractEventFromFlyer,
  flyerToFormDraft,
  FlyerExtractionError,
  FLYER_MAX_BYTES,
  FLYER_MEDIA_TYPES,
  isFlyerImageType,
  isFlyerMediaType,
} from "@/lib/flyer-extract"

/**
 * POST /api/admin/events/extract-flyer  (multipart, field `flyer`)
 *
 * Reads an uploaded flyer with Claude and returns a draft for the create-event
 * form (#69). Nothing is created here: the admin sees every field, edits, and
 * saves through the normal event API. An image flyer is also stored under
 * /uploads/flyers so it can be the event's featured image.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "Expected a multipart form with a `flyer` file" }, { status: 400 })
  }

  const file = form.get("flyer")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded" }, { status: 400 })
  }
  const mediaType = file.type
  if (!isFlyerMediaType(mediaType)) {
    return NextResponse.json(
      { error: `Unsupported file type ${mediaType || "(unknown)"}. Upload one of: ${FLYER_MEDIA_TYPES.join(", ")}` },
      { status: 415 },
    )
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "The uploaded file is empty" }, { status: 400 })
  }
  if (file.size > FLYER_MAX_BYTES) {
    return NextResponse.json(
      { error: `The file is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is ${FLYER_MAX_BYTES / 1024 / 1024} MB` },
      { status: 413 },
    )
  }

  const data = Buffer.from(await file.arrayBuffer())
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date())

  return Sentry.startSpan({ op: "ai.extract", name: "Extract event from flyer" }, async (span) => {
    span.setAttribute("flyer.media_type", mediaType)
    span.setAttribute("flyer.bytes", file.size)

    try {
      const extraction = await extractEventFromFlyer({ data, mediaType, today })
      const draft = flyerToFormDraft(extraction)

      // Keep the flyer as the featured image when it is one. PDFs are not images and
      // are not stored: an <img> pointing at a PDF renders broken.
      if (isFlyerImageType(mediaType)) {
        const stored = await storeFlyer(data, file.name, mediaType, request)
        if (stored) draft.fields.image = stored
        else draft.warnings.push("The flyer could not be stored as the event image; add one by hand.")
      } else {
        draft.warnings.push("PDF flyers are read but not used as the event image; add an image by hand.")
      }

      span.setAttribute("flyer.low_confidence", draft.lowConfidence.length)
      return NextResponse.json({ draft, extraction })
    } catch (error) {
      if (error instanceof FlyerExtractionError) {
        // Expected outcomes, phrased for the admin. Not Sentry-worthy except misconfiguration.
        if (error.reason === "not_configured") Sentry.captureException(error)
        const status = error.reason === "not_configured" ? 503 : error.reason === "not_a_flyer" ? 422 : 502
        return NextResponse.json({ error: error.message, reason: error.reason }, { status })
      }
      Sentry.captureException(error)
      return NextResponse.json({ error: "Reading the flyer failed unexpectedly" }, { status: 500 })
    }
  })
}

/**
 * Write the flyer under public/uploads/flyers (the bind-mounted uploads volume in
 * production, served by nginx) and return an absolute URL, or null if the volume
 * is not writable. The create-event API validates `image` as a URL, so relative
 * paths are not an option here.
 */
async function storeFlyer(data: Buffer, originalName: string, mediaType: string, request: NextRequest): Promise<string | null> {
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" }[mediaType] ?? "bin"
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "flyer"
  const stamp = new Date().toISOString().slice(0, 10)
  const name = `${stamp}-${base}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const dir = path.join(process.cwd(), "public", "uploads", "flyers")
  try {
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, name), data, { flag: "wx" })
  } catch (error) {
    Sentry.captureException(error)
    return null
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? new URL(request.url).origin
  return `${origin.replace(/\/$/, "")}/uploads/flyers/${name}`
}
