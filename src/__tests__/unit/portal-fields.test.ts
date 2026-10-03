import { csvCell } from '@/lib/csv'
import { optionalEmail, optionalText, optionalUrl, withScheme } from '@/lib/optional-fields'

describe('csvCell', () => {
  it('doubles embedded quotes', () => {
    expect(csvCell('Say "hi"')).toBe('"Say ""hi"""')
  })

  it('neutralises spreadsheet formulas', () => {
    for (const v of ['=1+1', '+1', '-1', '@SUM(A1)']) {
      expect(csvCell(v)).toBe(`"'${v}"`)
    }
    expect(csvCell('a=b')).toBe('"a=b"')
  })

  it('writes null and undefined as empty', () => {
    expect(csvCell(null)).toBe('""')
    expect(csvCell(undefined)).toBe('""')
  })
})

describe('optional form fields', () => {
  it('turns a cleared field into null', () => {
    expect(optionalText().parse('')).toBeNull()
    expect(optionalText().parse('  ')).toBeNull()
    expect(optionalEmail().parse('')).toBeNull()
    expect(optionalUrl().parse('')).toBeNull()
    expect(optionalText().parse(undefined)).toBeUndefined()
  })

  it('lower-cases emails and rejects bad ones', () => {
    expect(optionalEmail().parse('A@Example.COM')).toBe('a@example.com')
    expect(optionalEmail().safeParse('nope').success).toBe(false)
  })

  it('adds https:// to a bare domain and refuses other schemes', () => {
    expect(withScheme('example.com')).toBe('https://example.com')
    expect(optionalUrl().parse('example.com/about')).toBe('https://example.com/about')
    expect(optionalUrl().parse('http://example.com')).toBe('http://example.com')
    expect(optionalUrl().safeParse('javascript://alert(1)').success).toBe(false)
  })
})
