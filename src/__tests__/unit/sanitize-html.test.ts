/**
 * @jest-environment node
 *
 * Event descriptions became HTML when 269 WordPress events were imported (#57).
 * Rendering them means `dangerouslySetInnerHTML`, so what this allowlist lets
 * through is the whole of the defence.
 */
import { sanitizeRichText, looksLikeHtml, toPlainText } from '@/lib/sanitize-html'

describe('sanitizeRichText', () => {
  it('keeps the markup imported events actually use', () => {
    const html = sanitizeRichText(
      '<p dir="ltr">Join <strong>BASA</strong> for a <em>mixer</em>.</p>' +
      '<h2>Event Details</h2><ul><li>4:30 PM</li><li>Free parking</li></ul>'
    )
    expect(html).toContain('<strong>BASA</strong>')
    expect(html).toContain('<em>mixer</em>')
    expect(html).toContain('<h2>Event Details</h2>')
    expect(html).toContain('<li>4:30 PM</li>')
    expect(html).toContain('dir="ltr"')
  })

  it('drops script tags and their contents, not just the tags', () => {
    const html = sanitizeRichText('<p>Before</p><script>alert(document.cookie)</script><p>After</p>')
    expect(html).not.toContain('script')
    expect(html).not.toContain('alert')
    expect(html).toContain('<p>Before</p>')
    expect(html).toContain('<p>After</p>')
  })

  it('strips event handlers and javascript: urls', () => {
    expect(sanitizeRichText('<p onclick="steal()">Click</p>')).toBe('<p>Click</p>')
    expect(sanitizeRichText('<a href="javascript:alert(1)">Go</a>')).not.toContain('javascript:')
    expect(sanitizeRichText('<img src="javascript:alert(1)">')).not.toContain('javascript:')
    // data: URIs are how an <a> or <img> smuggles script past a naive filter.
    expect(sanitizeRichText('<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>')).not.toContain('data:')
  })

  it('marks outbound links noopener, since every imported link is external', () => {
    const html = sanitizeRichText('<a href="https://example.com">Tickets</a>')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
  })

  it('demotes h1 so the page keeps one heading at the top level', () => {
    // Imported descriptions open with their own <h1>; the page already has one.
    expect(sanitizeRichText('<h1>Escape the Office</h1>')).toBe('<h2>Escape the Office</h2>')
  })

  it('drops inline styles and unknown tags but keeps their text', () => {
    expect(sanitizeRichText('<p style="font-size:16px">Sized</p>')).toBe('<p>Sized</p>')
    expect(sanitizeRichText('<center>Bingo</center>')).toBe('Bingo')
  })

  it('leaves ordinary text alone, emoji included', () => {
    expect(sanitizeRichText('<p>🎳 Bowling &amp; networking</p>')).toBe('<p>🎳 Bowling &amp; networking</p>')
  })
})

describe('looksLikeHtml', () => {
  it('separates imported HTML from text typed into basa-app', () => {
    expect(looksLikeHtml('<p>Imported</p>')).toBe(true)
    expect(looksLikeHtml('Join us on Tuesday.\n\nDoors at 4:30.')).toBe(false)
    // Not markup, and must not be treated as such - it would be rendered away.
    expect(looksLikeHtml('Seats < 20 remaining')).toBe(false)
  })
})

describe('toPlainText', () => {
  it('produces something fit for a meta description', () => {
    expect(toPlainText('<h1><strong>Escape the Office</strong></h1><p>Join BASA.</p>'))
      .toBe('Escape the Office Join BASA.')
  })

  it('truncates on a word boundary', () => {
    const text = toPlainText('<p>Networking mixer at the Briscoe Western Art Museum downtown</p>', 30)
    expect(text.length).toBeLessThanOrEqual(31)
    expect(text.endsWith('…')).toBe(true)
    expect(text).not.toContain('Museu…')
  })

  it('unescapes entities rather than showing them', () => {
    expect(toPlainText('<p>Bowling &amp; networking</p>')).toBe('Bowling & networking')
  })
})
