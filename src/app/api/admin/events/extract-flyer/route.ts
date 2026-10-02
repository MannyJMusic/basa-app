import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { storeImage } from "@/lib/uploads"
import { matchVenue } from "@/lib/venues"
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
        const stored = await storeImage(data, file.name, mediaType, "flyers", request.url)
        if (stored) draft.fields.image = stored.url
        else draft.warnings.push("The flyer could not be stored as the event image; add one by hand.")
      } else {
        draft.warnings.push("PDF flyers are read but not used as the event image; add an image by hand.")
      }

      // Link to a known venue so the event page gets its photo and map. An unknown
      // one is created when the event is saved (autoVenue), not here.
      if (draft.fields.location) {
        const venues = await prisma.venue.findMany({ select: { id: true, name: true, address: true, city: true, state: true, zipCode: true } })
        const venue = matchVenue(venues, draft.fields.location)
        if (venue) {
          draft.fields.venueId = venue.id
          draft.fields.location = venue.name
          if (!draft.fields.address && venue.address) draft.fields.address = venue.address
          if (!draft.fields.city && venue.city) draft.fields.city = venue.city
          if (!draft.fields.state && venue.state) draft.fields.state = venue.state
          if (!draft.fields.zipCode && venue.zipCode) draft.fields.zipCode = venue.zipCode
          draft.warnings.push(`Matched the saved venue "${venue.name}".`)
        } else {
          draft.warnings.push(`"${draft.fields.location}" is a new venue and will be saved with the event.`)
        }
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
