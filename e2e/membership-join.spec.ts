import { test, expect } from '@playwright/test'
import { db } from './helpers/db'
import { deliverEvent, payOnStripeCheckout, stripeTestClient } from './helpers/stripe'

/**
 * The membership money path (2026 relaunch): a visitor with no account picks a
 * level, gives their details, pays on Stripe Checkout in test mode, lands on the
 * welcome page, and the webhook turns that into an active, auto-renewing membership.
 */
test.describe('Membership join', () => {
  test('a visitor joins as a Meeting Member through Stripe Checkout', async ({ page, request, baseURL }) => {
    const stamp = Date.now()
    const email = `e2e-member-${stamp}@example.com`

    await page.goto('/membership/join?tier=meeting')
    const pay = page.getByRole('button', { name: /Continue to payment: \$350\/yr/ })
    // Nothing can be bought until the terms are accepted.
    await expect(pay).toBeDisabled()

    await page.locator('input[name="firstName"]').fill('E2E')
    await page.locator('input[name="lastName"]').fill(`Member ${stamp}`)
    await page.locator('input[name="email"]').fill(email)
    await page.locator('input[name="phone"]').fill('2105550100')
    await page.locator('input[name="businessName"]').fill('E2E Test Co')
    await page.getByText(/I agree to these terms/).click()
    await expect(pay).toBeEnabled()
    await pay.click()

    await payOnStripeCheckout(page)
    await page.waitForURL(/\/membership\/welcome\?session_id=cs_test_/, { timeout: 90_000 })
    await expect(page.getByRole('heading', { name: 'Welcome to BASA!' })).toBeVisible()

    const sessionId = new URL(page.url()).searchParams.get('session_id')!
    const session = await stripeTestClient().checkout.sessions.retrieve(sessionId)
    expect(session.mode).toBe('subscription')
    const delivered = await deliverEvent(request, baseURL!, 'checkout.session.completed', session)
    expect(delivered.status, delivered.body).toBe(200)

    const user = await db().user.findUnique({ where: { email }, include: { member: true } })
    expect(user, 'the webhook creates the account for a guest join').not.toBeNull()
    expect(user!.role).toBe('MEMBER')
    expect(user!.member?.membershipStatus).toBe('ACTIVE')
    expect(user!.member?.membershipTier).toBe('MEETING_MEMBER')
    expect(user!.member?.subscriptionId).toMatch(/^sub_/)
    expect(user!.member?.renewalDate?.getTime()).toBeGreaterThan(Date.now() + 300 * 86_400_000)
  })
})
