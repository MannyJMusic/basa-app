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

const SYSTEM_PROMPT = `You read event flyers for the Business Association of San Antonio (BASA), a Texas business networking association, and fill in the fields of an event listing.

Take every value from the flyer itself. Do not invent a venue, a price or a time that is not printed. Where the flyer is silent, return null. Where you had to infer or the print is hard to read, still give your best reading but name the field in lowConfidenceFields.

Dates: flyers often print a weekday and day without a year. Use the year that makes the date fall on or after today, and check the weekday matches; if it does not, name startDate in lowConfidenceFields. Times are local San Antonio time.

Addresses: BASA events are in or around San Antonio, Texas. Fill city and state from the flyer when printed; if only a venue name is printed, leave address, city, state and zipCode null rather than guessing.`

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
