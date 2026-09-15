/**
 * The forms a stored slug might take for one requested URL.
 *
 * WordPress percent-encodes non-ASCII slugs and the importer kept that form
 * (`%f0%9f%8e%84-basa-todays-deal-of-the-day-%f0%9f%8e%84`), but Next hands a
 * route the *decoded* path segment (`🎄-basa-…`). Looking up both forms lets the
 * old URL, the redirect map's destination, and a typed-in emoji all resolve.
 */
export function slugCandidates(slug: string): string[] {
  const out = new Set<string>([slug])
  try {
    out.add(encodeURIComponent(slug).toLowerCase())
    out.add(decodeURIComponent(slug))
  } catch {
    /* malformed escape sequence: the raw form is all we can try */
  }
  return Array.from(out)
}
