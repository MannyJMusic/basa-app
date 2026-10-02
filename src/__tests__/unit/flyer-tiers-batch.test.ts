import { deriveTiers, audienceFromName, flyerToFormDraft, type FlyerExtraction } from '@/lib/flyer-draft'
import { draftToPayload, slugAttempts } from '@/lib/flyer-batch'
import { thumbnailUrl } from '@/lib/event-image'
import { matchVenue } from '@/lib/venues'

describe('audienceFromName', () => {
  it.each([
    ['Member', 'MEMBER'],
    ['Members', 'MEMBER'],
    ['BASA Member Rate', 'MEMBER'],
    ['Future Member', 'NON_MEMBER'],
    ['Future Members', 'NON_MEMBER'],
    ['Non-Member Admission', 'NON_MEMBER'],
    ['Guest', 'NON_MEMBER'],
    ['General Admission', 'ALL'],
    ['Table of 8', 'ALL'],
  ])('%s -> %s', (name, audience) => expect(audienceFromName(name)).toBe(audience))
})

describe('deriveTiers', () => {
  it('uses the flyer levels when printed', () => {
    const t = deriveTiers({ ticketTiers: [{ name: 'Members', price: 18 }, { name: 'Future Members', price: 25 }], price: null, memberPrice: null })
    expect(t).toEqual([
      { name: 'Members', price: 18, audience: 'MEMBER' },
      { name: 'Future Members', price: 25, audience: 'NON_MEMBER' },
    ])
  })
  it('splits a price and member price into Member and Future Member', () => {
    expect(deriveTiers({ ticketTiers: [], price: 25, memberPrice: 18 })).toEqual([
      { name: 'Member', price: 18, audience: 'MEMBER' },
      { name: 'Future Member', price: 25, audience: 'NON_MEMBER' },
    ])
  })
  it('makes one open ticket when there is a single price', () => {
    expect(deriveTiers({ ticketTiers: [], price: 10, memberPrice: null })).toEqual([{ name: 'General admission', price: 10, audience: 'ALL' }])
  })
  it('makes none when no price is printed', () => {
    expect(deriveTiers({ ticketTiers: [{ name: 'Sponsor', price: null }], price: null, memberPrice: null })).toEqual([])
  })
})

const base: FlyerExtraction = {
  isEventFlyer: true, title: 'Taco Tuesday', description: '<p>Hi</p>', shortDescription: '',
  startDate: '2026-11-17', startTime: '08:30', endDate: '', endTime: '10:00',
  venueName: "Smokey Mo's", address: '', city: '', state: '', zipCode: '',
  price: 25, memberPrice: 18, capacity: null, eventType: 'NETWORKING', category: 'Breakfast',
  ticketTiers: [], contactName: '', contactEmail: '', contactPhone: '', registrationUrl: '',
  lowConfidenceFields: [], notes: '',
}

describe('flyerToFormDraft tiers', () => {
  it('returns member and future member tiers and a from-price', () => {
    const d = flyerToFormDraft(base)
    expect(d.tiers.map(t => t.audience)).toEqual(['MEMBER', 'NON_MEMBER'])
    expect(d.fields.price).toBe(25)
    expect(d.fields.memberPrice).toBe(18)
  })
  it('warns when no price is printed', () => {
    const d = flyerToFormDraft({ ...base, price: null, memberPrice: null })
    expect(d.tiers).toEqual([])
    expect(d.warnings.join(' ')).toMatch(/No ticket price/)
  })
})

describe('draftToPayload', () => {
  const draft = flyerToFormDraft(base)
  it('builds a complete payload', () => {
    const { payload, missing } = draftToPayload(draft.fields, draft.tiers, 'DRAFT')
    expect(missing).toEqual([])
    expect(payload).toMatchObject({ status: 'DRAFT', autoVenue: true, slug: 'taco-tuesday', ticketTiers: draft.tiers })
  })
  it('reports what is missing', () => {
    const { payload, missing } = draftToPayload({ ...draft.fields, location: '' }, draft.tiers, 'DRAFT')
    expect(payload).toBeNull()
    expect(missing).toEqual(['venue'])
  })
  it('does not auto-create a venue that is already linked', () => {
    expect(draftToPayload({ ...draft.fields, venueId: 'v1' }, [], 'PUBLISHED').payload).toMatchObject({ venueId: 'v1', autoVenue: false })
  })
  it('offers dated slug fallbacks', () => {
    expect(slugAttempts('taco', '2026-11-17T08:30')).toEqual(['taco', 'taco-2026-11-17', 'taco-2026-11-17-2', 'taco-2026-11-17-3', 'taco-2026-11-17-4'])
  })
})

describe('thumbnailUrl', () => {
  it('maps stored uploads to their thumbnail', () => {
    expect(thumbnailUrl('https://businessassociationsa.com/uploads/flyers/2026-10-02-x-ab12.png')).toBe('https://businessassociationsa.com/uploads/flyers/thumbs/2026-10-02-x-ab12.webp')
    expect(thumbnailUrl('/uploads/venues/logo.jpg')).toBe('/uploads/venues/thumbs/logo.webp')
  })
  it('has none for imported or external images', () => {
    expect(thumbnailUrl('/uploads/gallery_medium.jpg')).toBeNull()
    expect(thumbnailUrl(null)).toBeNull()
  })
})

describe('matchVenue', () => {
  const venues = [{ id: '1', name: "Smokey Mo's" }, { id: '2', name: 'The Curve' }, { id: '3', name: 'Main Event Entertainment' }]
  it('matches ignoring case and punctuation', () => expect(matchVenue(venues, 'smokey mos')?.id).toBe('1'))
  it('matches a longer printed name containing a saved one', () => expect(matchVenue(venues, "Smokey Mo's - Stone Oak")?.id).toBe('1'))
  it('does not guess on short or unknown names', () => {
    expect(matchVenue(venues, 'Bar')).toBeNull()
    expect(matchVenue(venues, 'Elsewhere Too')).toBeNull()
  })
})
