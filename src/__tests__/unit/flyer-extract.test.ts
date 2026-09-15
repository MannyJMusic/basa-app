/**
 * The mapping from Claude's extraction to the admin form (#69). The API call is
 * not exercised here; this is the pure part that can silently produce a wrong
 * event if it drifts.
 */
import { flyerToFormDraft, slugify, FlyerExtractionSchema, type FlyerExtraction } from '@/lib/flyer-draft'

function extraction(overrides: Partial<FlyerExtraction> = {}): FlyerExtraction {
  return {
    isEventFlyer: true,
    title: '',
    description: '',
    shortDescription: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venueName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: null,
    memberPrice: null,
    capacity: null,
    eventType: null,
    category: '',
    ticketTiers: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    registrationUrl: '',
    lowConfidenceFields: [],
    notes: '',
    ...overrides,
  }
}

describe('slugify', () => {
  it('matches the shape the importer preserved from WordPress', () => {
    expect(slugify('BASA "Battle of the Businesses" Bowling Tournament')).toBe('basa-battle-of-the-businesses-bowling-tournament')
    expect(slugify('Coffee & Connects at The Mermaid Café')).toBe('coffee-and-connects-at-the-mermaid-cafe')
    expect(slugify('  --Mixer--  ')).toBe('mixer')
  })
})

describe('flyerToFormDraft', () => {
  it('fills the form from a complete flyer with no warnings about defaults', () => {
    const draft = flyerToFormDraft(
      extraction({
        title: 'Monday Mixer @ Beerhead',
        description: 'Casual networking over drinks.',
        shortDescription: 'Networking mixer',
        startDate: '2026-10-13',
        startTime: '17:30',
        endTime: '19:30',
        venueName: 'Beerhead Bar & Eatery',
        address: '19338 Babcock Rd',
        city: 'San Antonio',
        state: 'tx',
        zipCode: '78255',
        price: 0,
        eventType: 'NETWORKING',
        category: 'Mixer',
      }),
    )
    expect(draft.fields).toEqual({
      title: 'Monday Mixer @ Beerhead',
      slug: 'monday-mixer-beerhead',
      description: 'Casual networking over drinks.',
      shortDescription: 'Networking mixer',
      startDate: '2026-10-13T17:30',
      endDate: '2026-10-13T19:30',
      location: 'Beerhead Bar & Eatery',
      address: '19338 Babcock Rd',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78255',
      price: 0,
      type: 'NETWORKING',
      category: 'Mixer',
    })
    expect(draft.warnings).toEqual([])
    expect(draft.lowConfidence).toEqual([])
  })

  it('assumes a start time and a two-hour end when the flyer has neither, and says so', () => {
    const draft = flyerToFormDraft(extraction({ title: 'Ribbon Cutting', startDate: '2026-11-05', eventType: 'RIBBON_CUTTING' }))
    expect(draft.fields.startDate).toBe('2026-11-05T09:00')
    expect(draft.fields.endDate).toBe('2026-11-05T11:00')
    expect(draft.fields.category).toBe('Ribbon Cutting')
    expect(draft.lowConfidence).toEqual(expect.arrayContaining(['startDate', 'endDate']))
    expect(draft.warnings.join(' ')).toMatch(/09:00 was assumed/)
    expect(draft.warnings.join(' ')).toMatch(/2 hours was assumed/)
  })

  it('rolls a default end time past midnight correctly', () => {
    const draft = flyerToFormDraft(extraction({ title: 'Late Show', startDate: '2026-12-31', startTime: '23:00' }))
    expect(draft.fields.endDate).toBe('2027-01-01T01:00')
  })

  it('refuses an end before the start and falls back to two hours', () => {
    const draft = flyerToFormDraft(extraction({ title: 'Brunch', startDate: '2026-10-04', startTime: '11:00', endTime: '09:00' }))
    expect(draft.fields.endDate).toBe('2026-10-04T13:00')
    expect(draft.warnings.join(' ')).toMatch(/end time was before its start/)
    expect(draft.lowConfidence).toContain('endDate')
  })

  it('reports rather than drops what the form cannot hold', () => {
    const draft = flyerToFormDraft(
      extraction({
        title: 'Bowling Tournament',
        startDate: '2026-09-15',
        startTime: '18:00',
        endTime: '21:00',
        ticketTiers: [
          { name: 'Team of 4', price: 200 },
          { name: 'Lane Sponsor', price: 500 },
          { name: 'Spectator', price: null },
        ],
        contactName: 'Jen',
        contactEmail: 'jen@example.com',
        registrationUrl: 'https://example.com/bowl',
        notes: 'Shoe rental included.',
      }),
    )
    const text = draft.warnings.join('\n')
    expect(text).toContain('Team of 4 ($200), Lane Sponsor ($500), Spectator')
    expect(text).toContain('Jen, jen@example.com')
    expect(text).toContain('https://example.com/bowl')
    expect(text).toContain('Shoe rental included.')
  })

  it('carries the model\'s own low-confidence flags through and adds its own', () => {
    const draft = flyerToFormDraft(extraction({ title: 'Something', lowConfidenceFields: ['title', 'venueName'] }))
    expect(draft.lowConfidence).toEqual(expect.arrayContaining(['title', 'venueName', 'startDate', 'endDate']))
    expect(draft.warnings).toContain('No date could be read from the flyer.')
  })

  it('uses the title as a placeholder description and flags it', () => {
    const draft = flyerToFormDraft(extraction({ title: 'Coffee Talk', startDate: '2026-10-01', startTime: '08:00', endTime: '09:00' }))
    expect(draft.fields.description).toBe('Coffee Talk')
    expect(draft.lowConfidence).toContain('description')
  })

  it('ignores malformed dates and times instead of producing an invalid datetime', () => {
    const draft = flyerToFormDraft(extraction({ title: 'X', startDate: 'Oct 13', startTime: '5pm' }))
    expect(draft.fields.startDate).toBeUndefined()
    expect(draft.fields.endDate).toBeUndefined()
    expect(draft.warnings).toContain('No date could be read from the flyer.')
  })

  it('drops negative prices and non-positive capacity', () => {
    const draft = flyerToFormDraft(extraction({ title: 'X', price: -5, memberPrice: 10, capacity: 0 }))
    expect(draft.fields.price).toBeUndefined()
    expect(draft.fields.memberPrice).toBe(10)
    expect(draft.fields.capacity).toBeUndefined()
  })
})

describe('FlyerExtractionSchema', () => {
  it('has no optional field and at most 16 nullable ones, as structured outputs require', () => {
    const shape = FlyerExtractionSchema.shape
    for (const [key, field] of Object.entries(shape)) {
      // Every key must be present in the model's answer; absence is a schema violation.
      expect(field.isOptional()).toBe(false)
      void key
    }
    const nullable = Object.values(shape).filter((f) => f.isNullable()).length
    expect(nullable).toBeLessThanOrEqual(16)
    expect(FlyerExtractionSchema.safeParse({ isEventFlyer: true }).success).toBe(false)
    expect(FlyerExtractionSchema.safeParse(extraction()).success).toBe(true)
  })
})
