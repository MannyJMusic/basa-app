/**
 * @jest-environment node
 *
 * Who counts as an unclaimed legacy account (#104), and what claiming is allowed to
 * change. The 135 members imported from PMPro have no password and cannot sign in;
 * this is the boundary that decides who gets offered a way in.
 */
import { isUnclaimedLegacyAccount, CLAIM_ACTIVATION } from '@/lib/account-claim'
import type { AccountStatus } from '@prisma/client'

const user = (hashedPassword: string | null, accountStatus: AccountStatus) =>
  ({ hashedPassword, accountStatus })

describe('isUnclaimedLegacyAccount', () => {
  it('recognises an imported member: no password, INACTIVE', () => {
    expect(isUnclaimedLegacyAccount(user(null, 'INACTIVE'))).toBe(true)
  })

  it('does not treat a real account as unclaimed', () => {
    expect(isUnclaimedLegacyAccount(user('$2a$10$hash', 'ACTIVE'))).toBe(false)
  })

  it('will not reactivate an account an admin deliberately suspended', () => {
    // The important one. If a password reset could flip this back on, suspension
    // would be undone by anyone who controls the mailbox.
    expect(isUnclaimedLegacyAccount(user('$2a$10$hash', 'SUSPENDED'))).toBe(false)
  })

  it('will not treat a suspended account with no password as claimable', () => {
    expect(isUnclaimedLegacyAccount(user(null, 'SUSPENDED'))).toBe(false)
  })

  it('leaves Google sign-ins alone even though they have no password', () => {
    // OAuth users carry no hashedPassword either; accountStatus is what separates
    // them from an import.
    expect(isUnclaimedLegacyAccount(user(null, 'ACTIVE'))).toBe(false)
    expect(isUnclaimedLegacyAccount(user(null, 'PENDING_VERIFICATION'))).toBe(false)
  })

  it('treats an INACTIVE account that has a password as a normal reset', () => {
    expect(isUnclaimedLegacyAccount(user('$2a$10$hash', 'INACTIVE'))).toBe(false)
  })
})

describe('CLAIM_ACTIVATION', () => {
  it('makes the account usable', () => {
    // Without both of these a claimed member sets a password and is still silently
    // refused at sign-in, which authorize() rejects on !isActive.
    expect(CLAIM_ACTIVATION.isActive).toBe(true)
    expect(CLAIM_ACTIVATION.accountStatus).toBe('ACTIVE')
  })

  it('does not touch role: claiming an account is not renewing a membership', () => {
    // A lapsed member gets back into their account, not back into a membership.
    // The Stripe webhook promotes them to MEMBER when they actually pay.
    expect(Object.keys(CLAIM_ACTIVATION)).toEqual(['isActive', 'accountStatus'])
  })
})
