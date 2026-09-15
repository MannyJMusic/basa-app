/**
 * The forms a stored slug might take for one requested URL.
 *
 * WordPress percent-encodes non-ASCII slugs in lowercase and the importer kept
 * that form (`%f0%9f%8e%84-basa-todays-deal-of-the-day-%f0%9f%8e%84`). What a
 * route receives depends on the caller: Next hands a page the path segment still
 * encoded but normalised to UPPERCASE (`%F0%9F%8E%84-…`), a route handler may see
 * the decoded emoji, and a person may type either. Looking up every spelling lets
 * the old URL, the redirect map's destination and a typed-in emoji all resolve.
 */
export function slugCandidates(slug: string): string[] {
  const out = new Set<string>([slug])
  let decoded = slug
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    /* malformed escape sequence: keep the raw form only */
  }
  out.add(decoded)
  try {
    // WordPress's spelling: percent-encoded, lowercase hex.
    out.add(encodeURIComponent(decoded).toLowerCase())
  } catch {
    /* lone surrogate: nothing more to try */
  }
  if (slug.includes('%')) out.add(slug.toLowerCase())
  return Array.from(out)
}
