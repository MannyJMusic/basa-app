/**
 * Turning a reviewed flyer draft into the body of POST /api/events (#274). Pure, so
 * the batch page and the tests share one definition of "complete enough to save".
 */
import type { CreateEventData, UpdateEventData } from "@/hooks/use-events"
import { slugify, type TierDraft } from "@/lib/flyer-draft"

export type EventPayload = CreateEventData

export interface PayloadResult {
  payload: EventPayload | null
  /** Human names of required fields that are still empty. */
  missing: string[]
}

const REQUIRED: Array<[keyof CreateEventData, string]> = [
  ["title", "title"],
  ["description", "description"],
  ["startDate", "start"],
  ["endDate", "end"],
  ["location", "venue"],
]

export function draftToPayload(
  fields: Partial<CreateEventData>,
  tiers: TierDraft[],
  status: CreateEventData["status"],
): PayloadResult {
  const missing = REQUIRED.filter(([k]) => !String(fields[k] ?? "").trim()).map(([, label]) => label)
  if (fields.startDate && fields.endDate && fields.endDate <= fields.startDate) missing.push("end after start")
  if (missing.length > 0) return { payload: null, missing }

  return {
    missing,
    payload: {
      title: fields.title!.trim(),
      slug: (fields.slug || slugify(fields.title!)).trim(),
      description: fields.description!,
      shortDescription: fields.shortDescription || undefined,
      startDate: fields.startDate!,
      endDate: fields.endDate!,
      location: fields.location!.trim(),
      address: fields.address || undefined,
      city: fields.city || undefined,
      state: fields.state || undefined,
      zipCode: fields.zipCode || undefined,
      capacity: fields.capacity,
      price: fields.price,
      memberPrice: fields.memberPrice,
      category: fields.category?.trim() || "Networking",
      type: fields.type ?? "NETWORKING",
      status,
      isFeatured: false,
      image: fields.image || undefined,
      venueId: fields.venueId || undefined,
      autoVenue: !fields.venueId,
      ticketTiers: tiers.filter((t) => t.name.trim() && Number.isFinite(t.price)),
      tags: fields.tags ?? [],
    },
  }
}

/** Slugs to try in turn when the first is taken: dated, then numbered. */
export function slugAttempts(slug: string, startDate: string): string[] {
  const day = startDate.slice(0, 10)
  return [slug, `${slug}-${day}`, ...[2, 3, 4].map((n) => `${slug}-${day}-${n}`)]
}

/**
 * What a re-issued flyer changes on an event that already exists: the content and
 * the schedule, never the slug, status, tickets or registrations.
 */
export function fieldsToUpdate(fields: Partial<CreateEventData>): UpdateEventData {
  const keys = ["title", "description", "shortDescription", "startDate", "endDate", "location", "address", "city", "state", "zipCode", "image", "venueId", "category", "type"] as const
  const out: Record<string, unknown> = {}
  for (const k of keys) {
    const v = fields[k]
    if (v !== undefined && v !== null && String(v).trim() !== "") out[k] = v
  }
  return out as UpdateEventData
}
