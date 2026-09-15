/**
 * The pure half of flyer-to-event (#69): what Claude is asked for, and how that
 * becomes values for the admin form. No SDK import, so it is unit-testable under
 * jsdom and reusable without an API key.
 *
 * Zod v4 (`zod/v4`, shipped inside zod 3.25) because the Anthropic SDK's
 * structured-output helper is typed against it.
 */
import { z } from "zod/v4"
import type { CreateEventData } from "@/hooks/use-events"

export const FLYER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const
export const FLYER_MEDIA_TYPES = [...FLYER_IMAGE_TYPES, "application/pdf"] as const
export type FlyerMediaType = (typeof FLYER_MEDIA_TYPES)[number]
export type FlyerImageType = (typeof FLYER_IMAGE_TYPES)[number]

/** Anthropic accepts 32 MB requests; 10 MB is plenty for a flyer and keeps uploads quick. */
export const FLYER_MAX_BYTES = 10 * 1024 * 1024

export function isFlyerMediaType(value: string): value is FlyerMediaType {
  return (FLYER_MEDIA_TYPES as readonly string[]).includes(value)
}

export function isFlyerImageType(value: string): value is FlyerImageType {
  return (FLYER_IMAGE_TYPES as readonly string[]).includes(value)
}

const EVENT_TYPES = ["NETWORKING", "SUMMIT", "RIBBON_CUTTING", "COMMUNITY"] as const

/**
 * What Claude is asked to return. Every field is present (structured outputs allow
 * nothing optional). Text fields are plain strings where "" means "not on the
 * flyer": the API caps nullable/union-typed fields at 16 per schema, so only the
 * numbers and the enum are nullable. The mapping below treats "" and null alike.
 */
const text = (description: string) => z.string().describe(`${description}. Empty string if not on the flyer`)
export const FlyerExtractionSchema = z.object({
  isEventFlyer: z
    .boolean()
    .describe("false if the document is not an announcement for a single event (a menu, a logo, a newsletter, a blank page)"),
  title: text("Event name as printed, without dates or venue"),
  description: text("The full event page write-up as HTML in the BASA house style described in the instructions: a bold tagline, an intro paragraph, an Event Details list, Pricing when printed, then further sections. Facts only from the flyer; the enthusiasm is the house voice"),
  shortDescription: text("Leave empty: it is derived from the description"),
  startDate: text("YYYY-MM-DD. If the flyer omits the year, the next occurrence on or after today"),
  startTime: text("HH:MM, 24-hour, local time"),
  endDate: text("YYYY-MM-DD if a different day from startDate"),
  endTime: text("HH:MM, 24-hour"),
  venueName: text("Venue name"),
  address: text("Street address only, no city/state/zip"),
  city: text("City"),
  state: text("Two-letter state code"),
  zipCode: text("ZIP code"),
  price: z.number().nullable().describe("General admission in dollars. 0 when the flyer says free. null when no price is printed"),
  memberPrice: z.number().nullable().describe("Member price in dollars if a separate one is printed"),
  capacity: z.number().nullable().describe("Only if a headcount limit is printed"),
  eventType: z.enum(EVENT_TYPES).nullable().describe("RIBBON_CUTTING for ribbon cuttings and grand openings, SUMMIT for conferences and banquets, COMMUNITY for charity or family events, NETWORKING for mixers, coffees, happy hours"),
  category: text("A short label such as Mixer, Ribbon Cutting, Banquet, Workshop, Tournament, Coffee"),
  ticketTiers: z
    .array(z.object({ name: z.string(), price: z.number().nullable() }))
    .describe("Every distinct ticket or sponsorship level printed, with its dollar price"),
  contactName: text("Contact person"),
  contactEmail: text("Contact email"),
  contactPhone: text("Contact phone"),
  registrationUrl: text("Registration or RSVP link"),
  lowConfidenceFields: z
    .array(z.string())
    .describe("Names of fields above that were inferred, partly legible, or ambiguous, so a person checks them first"),
  notes: text("Anything on the flyer the fields above cannot hold: dress code, RSVP deadline, parking, sponsor names"),
})

export type FlyerExtraction = z.infer<typeof FlyerExtractionSchema>

// ---------------------------------------------------------------------------
// Mapping the extraction onto the admin form. Pure, and unit-tested.
// ---------------------------------------------------------------------------

export interface FlyerFormDraft {
  /** Fields to spread over the create-event form. Only keys with a value are present. */
  fields: Partial<CreateEventData>
  /** Field names the admin should look at first (from the model, plus our own defaults). */
  lowConfidence: string[]
  /** Things the form cannot hold, or defaults we had to pick. Shown, never hidden. */
  warnings: string[]
}

const DEFAULT_START_TIME = "09:00"
const DEFAULT_DURATION_MINUTES = 120

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/** Plain-text opening of an HTML description, the way the WordPress import wrote shortDescription. */
export function summarize(html: string, max = 300): string {
  const text = html
    .replace(/<(br|\/p|\/h\d|\/li)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#8217;|&rsquo;/g, "\u2019").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd() + "\u2026"
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** `YYYY-MM-DDTHH:MM`, the value a `datetime-local` input takes. */
function localDateTime(date: string, time: string): string {
  return `${date}T${time}`
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  const t = new Date(Date.UTC(y, m - 1, d, hh, mm + minutes))
  const pad = (n: number) => String(n).padStart(2, "0")
  return {
    date: `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`,
    time: `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`,
  }
}

/**
 * Turn the extraction into form values. Defaults are chosen only where the form
 * cannot be submitted without a value, and every default is reported as a warning.
 */
export function flyerToFormDraft(x: FlyerExtraction): FlyerFormDraft {
  const fields: Partial<CreateEventData> = {}
  const lowConfidence = new Set(x.lowConfidenceFields)
  const warnings: string[] = []

  if (x.title) {
    fields.title = x.title.trim()
    fields.slug = slugify(fields.title)
  }
  if (x.description) fields.description = x.description.trim()
  else if (x.title) {
    fields.description = x.title.trim()
    warnings.push("No description on the flyer; the title was used as a placeholder.")
    lowConfidence.add("description")
  }
  // The imported WordPress events carry the opening of the description, as plain
  // text, cut at about 300 characters with an ellipsis. Match that.
  if (fields.description) fields.shortDescription = summarize(fields.description)
  else if (x.shortDescription) fields.shortDescription = x.shortDescription.trim().slice(0, 300)

  // Dates. The form needs both ends; the flyer usually gives one.
  const startDate = x.startDate && DATE_RE.test(x.startDate) ? x.startDate : null
  if (startDate) {
    let startTime = x.startTime && TIME_RE.test(x.startTime) ? x.startTime : null
    if (!startTime) {
      startTime = DEFAULT_START_TIME
      warnings.push(`No start time on the flyer; ${DEFAULT_START_TIME} was assumed.`)
      lowConfidence.add("startDate")
    }
    fields.startDate = localDateTime(startDate, startTime)

    const endDate = x.endDate && DATE_RE.test(x.endDate) ? x.endDate : startDate
    let endTime = x.endTime && TIME_RE.test(x.endTime) ? x.endTime : null
    if (!endTime) {
      const end = addMinutes(startDate, startTime, DEFAULT_DURATION_MINUTES)
      endTime = end.time
      fields.endDate = localDateTime(x.endDate && DATE_RE.test(x.endDate) ? x.endDate : end.date, endTime)
      warnings.push(`No end time on the flyer; ${DEFAULT_DURATION_MINUTES / 60} hours was assumed.`)
      lowConfidence.add("endDate")
    } else {
      fields.endDate = localDateTime(endDate, endTime)
    }
    if (fields.endDate <= fields.startDate) {
      // An end time before the start on the same day usually means it runs past midnight
      // or the model misread am/pm. Either way a person has to look.
      const end = addMinutes(startDate, startTime, DEFAULT_DURATION_MINUTES)
      fields.endDate = localDateTime(end.date, end.time)
      warnings.push("The flyer's end time was before its start time; two hours was assumed instead.")
      lowConfidence.add("endDate")
    }
  } else {
    warnings.push("No date could be read from the flyer.")
    lowConfidence.add("startDate")
    lowConfidence.add("endDate")
  }

  if (x.venueName) fields.location = x.venueName.trim()
  if (x.address) fields.address = x.address.trim()
  if (x.city) fields.city = x.city.trim()
  if (x.state) fields.state = x.state.trim().toUpperCase().slice(0, 2)
  if (x.zipCode) fields.zipCode = x.zipCode.trim()

  if (x.price !== null && x.price >= 0) fields.price = x.price
  if (x.memberPrice !== null && x.memberPrice >= 0) fields.memberPrice = x.memberPrice
  if (x.capacity !== null && x.capacity > 0) fields.capacity = Math.round(x.capacity)

  if (x.eventType) fields.type = x.eventType
  if (x.category) fields.category = x.category.trim()
  else if (x.eventType) {
    fields.category = { NETWORKING: "Networking", SUMMIT: "Summit", RIBBON_CUTTING: "Ribbon Cutting", COMMUNITY: "Community" }[x.eventType]
  }

  // The form has one price and one member price; extra tiers are reported, not dropped.
  if (x.ticketTiers.length > 0) {
    const tiers = x.ticketTiers.map((t) => (t.price === null ? t.name : `${t.name} ($${t.price})`)).join(", ")
    warnings.push(`Ticket levels on the flyer: ${tiers}. Set these up as ticket tiers after saving.`)
  }

  const contact = [x.contactName, x.contactEmail, x.contactPhone].filter(Boolean).join(", ")
  if (contact) warnings.push(`Contact on the flyer: ${contact}.`)
  if (x.registrationUrl) warnings.push(`Registration link on the flyer: ${x.registrationUrl}.`)
  if (x.notes) warnings.push(x.notes.trim())

  return { fields, lowConfidence: Array.from(lowConfidence), warnings }
}
