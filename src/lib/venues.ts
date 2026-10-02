/**
 * Venue matching for events created from flyers (#274). A flyer prints a venue
 * name ("Smokey Mo's - Stone Oak"); the venue table holds the reusable record
 * (address, photo, map). Matching is by normalised name so punctuation and case
 * do not create duplicates.
 */
export function normalizeVenueName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

interface NamedVenue {
  id: string
  name: string
}

/** Exact normalised match first, then one name containing the other (min 6 chars). */
export function matchVenue<T extends NamedVenue>(venues: T[], name: string): T | null {
  const target = normalizeVenueName(name)
  if (!target) return null
  const exact = venues.find((v) => normalizeVenueName(v.name) === target)
  if (exact) return exact
  if (target.length < 6) return null
  const loose = venues.filter((v) => {
    const n = normalizeVenueName(v.name)
    return n.length >= 6 && (n.includes(target) || target.includes(n))
  })
  return loose.length === 1 ? loose[0] : null
}
