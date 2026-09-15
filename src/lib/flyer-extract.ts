/**
 * Flyer-to-event extraction (#69).
 *
 * An admin uploads an event flyer (image or PDF); Claude reads it and returns the
 * fields the event form needs. The result is a *draft* for a human to confirm -
 * nothing here writes to the database, and the caller is expected to show every
 * field for editing before saving.
 *
 * This replaces the retired BASA-AI-CREW mailbox poller. Its field list came from
 * that project's `event_parser.py`; none of the code did.
 */
import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import {
  FlyerExtractionSchema,
  type FlyerExtraction,
  type FlyerMediaType,
} from "@/lib/flyer-draft"

export * from "@/lib/flyer-draft"

/** Model id lives in config, not inline: override with ANTHROPIC_MODEL. */
export const FLYER_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5"

export class FlyerExtractionError extends Error {
  constructor(
    message: string,
    /** Why it failed, for the UI to phrase honestly. */
    readonly reason: "not_configured" | "declined" | "unreadable" | "not_a_flyer" | "api",
  ) {
    super(message)
    this.name = "FlyerExtractionError"
  }
}

export interface FlyerInput {
  data: Buffer
  mediaType: FlyerMediaType
  /** Today's date as YYYY-MM-DD in the association's timezone, for year inference. */
  today: string
}

const STYLE_EXEMPLAR = `<h1><strong>Escape the Office and Recharge at San Antonio's Most Unique Outdoor Venue!</strong></h1>
<p>You know that Tuesday afternoon feeling when you just need to <strong>get out of the office</strong>? We got you. Join BASA for a Happy Hour Networking Mixer at <strong>Elsewhere Too</strong> – a one-of-a-kind outdoor venue packed with photo-worthy installations, fun activities, food, drinks, and the perfect after-work vibe. This isn't your typical mixer – come recharge, reconnect, and remember why networking can actually be fun!</p>
<h2>Event Details</h2>
<ul>
<li><strong>📅 Date:</strong> Tuesday, October 13, 2026</li>
<li><strong>🕟 Time:</strong> 4:30 PM – 7:00 PM</li>
<li><strong>📍 Location:</strong> Elsewhere Too 4513 N Loop 1604 W, San Antonio, TX 78249</li>
</ul>
<h2>Pricing</h2>
<ul>
<li><strong>Members:</strong> $25</li>
<li><strong>Future Members:</strong> $35</li>
</ul>
<p><strong>Food, drinks, activities, and networking – all included in the price of a decent lunch!</strong></p>
<h2>What to Expect</h2>
<ul>
<li><strong>🍔 Food</strong> – Enjoy great bites at Elsewhere Too</li>
<li><strong>🍹 Drinks</strong> – Happy hour vibes with drinks flowing</li>
<li><strong>🤝 Build Your Network</strong> – Meet fellow San Antonio professionals</li>
</ul>
<h2>Perfect For:</h2>
<ul>
<li><strong>Business Owners</strong> ready to trade the office for something more fun</li>
<li><strong>BASA Members</strong> wanting to try a fresh venue</li>
<li><strong>Future Members</strong> curious about what BASA does</li>
</ul>
<h2>Registration</h2>
<p><strong>🌐 Register Online:</strong> businessassociationsa.com</p>
<p><strong>📞 Register by Phone:</strong> 210.549.7190</p>
<h2>Register Today!</h2>
<p><strong>Members: $25 | Future Members: $35</strong></p>
<p>Don't miss the Get Out of the Office Happy Hour Networking Mixer – where great venues meet great connections!</p>`

const SYSTEM_PROMPT = `You read event flyers for the Business Association of San Antonio (BASA), a Texas business networking association, and fill in the fields of an event listing on its website.

Take every fact from the flyer itself. Do not invent a venue, a price, a time or a sponsor that is not printed. Where the flyer is silent, return an empty string or null. Where you had to infer or the print is hard to read, still give your best reading but name the field in lowConfidenceFields.

Dates: flyers often print a weekday and day without a year. Use the year that makes the date fall on or after today, and check the weekday matches; if it does not, name startDate in lowConfidenceFields. Times are local San Antonio time.

Addresses: BASA events are in or around San Antonio, Texas. Fill city and state from the flyer when printed; if only a venue name is printed, leave address, city, state and zipCode empty rather than guessing.

The description is the event page itself and must follow BASA's house style, which every existing event on the site uses. It is HTML, and it reads like this:

<example>
${STYLE_EXEMPLAR}
</example>

Rules for the description:
- Start with a one-line <h1><strong>tagline</strong></h1>, then one or two <p> paragraphs of warm, upbeat introduction in BASA's voice ("Join BASA…", "This isn't your typical…"), bolding the key phrases.
- Then <h2>Event Details</h2> with a <ul> of emoji-labelled items: 📅 Date (weekday, month day, year), 🕔 Time (start – end, or the schedule the flyer prints, one item per time), 📍 Location (venue name then street address, city, state, ZIP), plus 🎉 Occasion or similar when relevant.
- Then <h2>Pricing</h2> as a <ul> of the printed ticket or sponsorship levels with dollar amounts, when any are printed. Omit the section if none are.
- Then two to four more <h2> sections chosen to fit the event, each a <ul> of <strong>label</strong> – detail items or a short <p>: What to Expect, Perfect For, What's Included, About the Venue, Sponsorship Opportunities, Why Attend. Only state what the flyer supports or what is generically true of a BASA networking event; do not invent amenities, agendas or sponsors.
- End with <h2>Registration</h2> (the flyer's website, phone or QR instructions) and a closing <h2>Register Today!</h2> with a bold one-line price recap and a final upbeat sentence.
- Use only <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>, <a>. No inline styles, no dir attributes, no images.
- Length: substantial but not padded — roughly 250 to 500 words. Keep each list item to one line.`

let cachedClient: Anthropic | null = null
/**
 * The SDK resolves credentials itself: ANTHROPIC_API_KEY in production, or a local
 * `ant auth login` profile in development. A missing or rejected credential surfaces
 * as AuthenticationError on the first call and is reported as "not configured".
 */
function client(): Anthropic {
  if (!cachedClient) cachedClient = new Anthropic()
  return cachedClient
}

/** Content block for the uploaded file: an image block or a PDF document block. */
function fileBlock(input: FlyerInput): Anthropic.Beta.BetaContentBlockParam {
  const data = input.data.toString("base64")
  if (input.mediaType === "application/pdf") {
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
  }
  return { type: "image", source: { type: "base64", media_type: input.mediaType, data } }
}

/**
 * Ask Claude for the fields. Throws FlyerExtractionError with a reason the UI can
 * explain; never returns a half-filled object pretending to be a success.
 */
export async function extractEventFromFlyer(input: FlyerInput): Promise<FlyerExtraction> {
  const anthropic = client()

  let response
  try {
    response = await anthropic.beta.messages.parse({
      model: FLYER_MODEL,
      max_tokens: 16000,
      // Route a policy decline to a fallback model server-side rather than failing the upload.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [
            fileBlock(input),
            { type: "text", text: `Today is ${input.today}. Extract the event details from this flyer.` },
          ],
        },
      ],
      output_config: { format: betaZodOutputFormat(FlyerExtractionSchema) },
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new FlyerExtractionError("No Anthropic credential is configured on the server, or it was rejected (set ANTHROPIC_API_KEY)", "not_configured")
    }
    if (error instanceof Anthropic.APIError) {
      throw new FlyerExtractionError(`Anthropic API error ${error.status ?? ""}: ${error.message}`, "api")
    }
    throw error
  }

  if (response.stop_reason === "refusal") {
    throw new FlyerExtractionError("The model declined to read this file", "declined")
  }
  const parsed = response.parsed_output
  if (!parsed) {
    throw new FlyerExtractionError("The model's answer could not be parsed into event fields", "unreadable")
  }
  if (!parsed.isEventFlyer) {
    throw new FlyerExtractionError("This does not look like an event flyer", "not_a_flyer")
  }
  return parsed
}
