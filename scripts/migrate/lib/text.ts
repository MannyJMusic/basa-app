/** Small text helpers shared by the WordPress importers. */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  eacute: 'é', rsaquo: '›', lsaquo: '‹', trade: '™',
  reg: '®', copy: '©', deg: '°', middot: '·',
}

/**
 * WordPress stores titles and term names with entities already encoded
 * ("Anne Marie&#8217;s Catering &amp; Events"). React escapes on render, so
 * importing them raw shows the entity text to members.
 */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body.charAt(0) === '#') {
      const code = body.charAt(1) === 'x' || body.charAt(1) === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    const named = NAMED_ENTITIES[body.toLowerCase()]
    return named === undefined ? whole : named
  })
}

export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

export interface ParsedAddress {
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

const STATE_NAMES: Record<string, string> = { texas: 'TX', tx: 'TX' }

/**
 * MEC keeps a venue's address as one free-text line, in whatever shape whoever
 * created the venue typed it:
 *
 *   "123 N Loop 1604 E, San Antonio, TX 78232"
 *   "19110 Stone Oak Pkwy, 78258"
 *   "I 410 and jones Maltsberger"
 *
 * The Venue model has separate columns, so this pulls off what it can from the
 * end and leaves the rest as the street address. Anything it cannot place stays
 * null rather than being guessed - a wrong city is worse than a missing one.
 */
export function parseUsAddress(raw: string): ParsedAddress {
  let rest = collapseWhitespace(decodeEntities(raw)).replace(/[,\s]+$/, '')
  if (!rest) return { address: null, city: null, state: null, zipCode: null }

  let zipCode: string | null = null
  const zip = /(?:^|[\s,])(\d{5})(?:-\d{4})?$/.exec(rest)
  if (zip) {
    zipCode = zip[1]
    rest = rest.slice(0, zip.index).replace(/[,\s]+$/, '')
  }

  let state: string | null = null
  const stateMatch = /(?:^|[\s,])([A-Za-z]{2}|Texas)$/i.exec(rest)
  if (stateMatch) {
    const mapped = STATE_NAMES[stateMatch[1].toLowerCase()]
    if (mapped) {
      state = mapped
      rest = rest.slice(0, stateMatch.index).replace(/[,\s]+$/, '')
    }
  }

  const parts = rest.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const city = parts[parts.length - 1]
    return { address: parts.slice(0, -1).join(', ') || null, city, state, zipCode }
  }
  return { address: parts[0] ?? null, city: null, state, zipCode }
}

/**
 * A first paragraph's worth of plain text, for `shortDescription` on the events
 * that have no WordPress excerpt (which is all of them).
 */
export function summarise(html: string, maxLength = 300): string | null {
  // Tags become a space so words either side do not run together, which then
  // leaves a gap in front of any punctuation that followed a tag ("BASA ." from
  // "<strong>BASA</strong>.").
  const text = collapseWhitespace(decodeEntities(html.replace(/<[^>]+>/g, ' ')))
    .replace(/\s+([.,;:!?)\]])/g, '$1')
  if (!text) return null
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, '')}…`
}
