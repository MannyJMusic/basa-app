import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize the rich text that comes with an event.
 *
 * Event descriptions were plain text until the WordPress importer (#57) brought
 * over 269 events written as HTML - headings, lists, emphasis, emoji. Rendering
 * that as text shows members the markup; rendering it unsanitized turns any
 * admin account into stored XSS, which after the September incident is not a
 * theoretical concern.
 *
 * The allowlist is what the imported content actually contains plus the obvious
 * neighbours. Anything else is dropped rather than escaped, because a member
 * seeing `<div class="elementor-widget">` is no better than seeing a script tag.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub', 'mark',
    'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    '*': ['dir'],
  },
  // No javascript:, no data: - data: URIs are how an <img> or <a> smuggles script.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  transformTags: {
    // The page already renders the event title as its h1. A second one from the
    // body breaks the document outline for screen readers and for search engines.
    h1: 'h2',
    // Every link in this content points off-site. `noopener` is the security
    // half of this; `noreferrer` keeps the reverse tabnabbing surface closed.
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
  // Inline styles from a WordPress editor are noise at best ("font-size: 16px"
  // on a heading) and a legacy injection surface at worst. The page's own styles
  // handle presentation.
  allowedStyles: {},
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
}

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS)
}

/**
 * True when the value carries markup worth rendering as HTML. Events created in
 * basa-app are plain text with real newlines, and running those through the
 * sanitizer would collapse the line breaks that `whitespace-pre-line` renders.
 */
export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

/**
 * The same content as plain text, for a meta description or a card summary.
 * `description.slice(0, 160)` on an imported event puts `<h1 dir="ltr"><strong`
 * into the page's meta description, which is what search engines then show.
 */
export function toPlainText(html: string, maxLength?: number): string {
  // Strip tags without gluing words together: sanitize-html simply removes them,
  // so "</h1><p>" would turn "Escape the Office" and "Join BASA" into one word.
  const spaced = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article|figcaption)>/gi, ' ')

  const text = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (maxLength === undefined || text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, '')}…`
}
