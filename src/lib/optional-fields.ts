import { z } from "zod"

/**
 * Form helpers for optional text fields. A cleared input arrives as "" and
 * must be stored as null rather than failing validation (an empty string is
 * not a valid email or URL) or being ignored (which made fields uncleareable).
 */
export const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value

/** Optional, nullable trimmed string; "" becomes null. */
export const optionalText = (max = 500) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional())

/** Optional, nullable email, lower-cased; "" becomes null. */
export const optionalEmail = () =>
  z.preprocess(
    emptyToNull,
    z.string().trim().toLowerCase().email("Enter a valid email address").max(254).nullable().optional()
  )

/** Adds https:// to a bare domain ("example.com" -> "https://example.com"). */
export function withScheme(value: unknown): unknown {
  if (typeof value !== "string") return value
  const v = value.trim()
  if (v === "") return null
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`
}

/** Optional, nullable http(s) URL; a bare domain gets https:// prefixed. */
export const optionalUrl = () =>
  z.preprocess(
    withScheme,
    z
      .string()
      .url("Enter a valid web address")
      .max(500)
      .refine(v => /^https?:\/\//i.test(v), "Web addresses must start with http:// or https://")
      .nullable()
      .optional()
  )
