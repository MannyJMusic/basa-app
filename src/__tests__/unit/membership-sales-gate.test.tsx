/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { MembershipOfficeNotice } from '@/components/membership/MembershipOfficeNotice'
import { OFFICE_CONTACT } from '@/lib/feature-flags'

describe('MembershipOfficeNotice', () => {
  it('tells the visitor to call Jen or email the office, and that online purchase is coming', () => {
    render(<MembershipOfficeNotice variant="page" intent="join" />)
    expect(screen.getByRole('heading', { name: 'Join BASA' })).toBeTruthy()
    expect(screen.getAllByText(new RegExp(OFFICE_CONTACT.phone.replace(/[()]/g, '\\$&'))).length).toBeGreaterThan(0)
    expect(screen.getAllByText(OFFICE_CONTACT.email).length).toBeGreaterThan(0)
    expect(screen.getByText(/Digital membership purchase and account management are coming soon/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /call/i })).toHaveAttribute('href', OFFICE_CONTACT.phoneHref)
    expect(screen.getByRole('link', { name: /email the office/i }).getAttribute('href')).toMatch(/^mailto:/)
  })

  it('uses the intent in its wording', () => {
    render(<MembershipOfficeNotice variant="card" intent="upgrade" />)
    expect(screen.getByText(/Want to change your membership\?/)).toBeTruthy()
    expect(screen.getByText(/To upgrade, call/)).toBeTruthy()
  })

  it('has a one-line form for tier cards', () => {
    const { container } = render(<MembershipOfficeNotice variant="inline" />)
    expect(container.querySelectorAll('a')).toHaveLength(2)
    expect(container.textContent).toMatch(/To join, call Jen at/)
  })
})

describe('MEMBERSHIP_SALES_ENABLED', () => {
  const original = process.env.MEMBERSHIP_SALES_ENABLED
  afterEach(() => {
    process.env.MEMBERSHIP_SALES_ENABLED = original
    jest.resetModules()
  })

  it('is off unless the environment says exactly "true"', () => {
    for (const [value, expected] of [[undefined, false], ['', false], ['false', false], ['1', false], ['TRUE', false], ['true', true]] as const) {
      jest.resetModules()
      if (value === undefined) delete process.env.MEMBERSHIP_SALES_ENABLED
      else process.env.MEMBERSHIP_SALES_ENABLED = value
      const flags = require('@/lib/feature-flags') as typeof import('@/lib/feature-flags')
      expect(flags.MEMBERSHIP_SALES_ENABLED).toBe(expected)
    }
  })
})
