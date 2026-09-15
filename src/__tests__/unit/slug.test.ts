import { slugCandidates } from '@/lib/slug'

describe('slugCandidates', () => {
  it('returns a plain slug unchanged, once', () => {
    expect(slugCandidates('basa-annual-banquet')).toEqual(['basa-annual-banquet'])
  })
  it('adds the lowercase percent-encoded form WordPress stored for emoji slugs', () => {
    const c = slugCandidates('🎄-basa-todays-deal-of-the-day-🎄')
    expect(c).toContain('%f0%9f%8e%84-basa-todays-deal-of-the-day-%f0%9f%8e%84')
    expect(c[0]).toBe('🎄-basa-todays-deal-of-the-day-🎄')
  })
  it('also decodes an already-encoded request so either spelling finds the row', () => {
    expect(slugCandidates('%f0%9f%8e%84-x')).toContain('🎄-x')
  })
  it('survives a malformed escape', () => {
    expect(slugCandidates('bad-%zz')).toEqual(['bad-%zz', 'bad-%25zz'])
  })
})
