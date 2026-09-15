import { slugCandidates } from '@/lib/slug'

const STORED = '%f0%9f%8e%84-basa-todays-deal-of-the-day-%f0%9f%8e%84'

describe('slugCandidates', () => {
  it('returns a plain slug unchanged, once', () => {
    expect(slugCandidates('basa-annual-banquet')).toEqual(['basa-annual-banquet'])
  })
  it('finds the stored lowercase form from what a Next page actually receives: uppercase percent-encoding', () => {
    expect(slugCandidates('%F0%9F%8E%84-basa-todays-deal-of-the-day-%F0%9F%8E%84')).toContain(STORED)
  })
  it('finds it from the decoded emoji too', () => {
    const c = slugCandidates('🎄-basa-todays-deal-of-the-day-🎄')
    expect(c[0]).toBe('🎄-basa-todays-deal-of-the-day-🎄')
    expect(c).toContain(STORED)
  })
  it('finds it from the lowercase encoded form itself', () => {
    expect(slugCandidates(STORED)).toContain(STORED)
  })
  it('survives a malformed escape', () => {
    expect(slugCandidates('bad-%zz')).toEqual(expect.arrayContaining(['bad-%zz']))
  })
})
