import { test, expect } from '@playwright/test'
import { db } from './helpers/db'
import { CARDS, deliverWebhook, fillStripeCard } from './helpers/stripe'

/**
 * The membership money path (#65): a visitor with no account picks a tier, gives
 * their details, pays in Stripe test mode, lands on the success page, and the
 * webhook turns that into an active member.
 */
test.describe('Membership join', () => {
  test('a visitor joins as a Meeting Member and the webhook activates the membership', async ({ page, request, baseURL }) => {
    const stamp = Date.now()
    const email = `e2e-member-${stamp}@example.com`

    await page.goto('/membership/join')
    // The cart must start empty: nothing pre-selected, and no way forward until something is.
    await expect(page.getByRole('button', { name: 'Next', exact: true }).last()).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Remove one Associate Member' })).toBeDisabled()
    await page.getByRole('button', { name: 'Add one Meeting Member' }).first().click()
    await page.getByRole('button', { name: 'Next', exact: true }).last().click()

    // Step 2: the applicant.
    await page.locator('input[name="firstName"]').fill('E2E')
    await page.locator('input[name="lastName"]').fill(`Member ${stamp}`)
    await page.locator('input[name="jobTitle"]').fill('Owner')
    await page.locator('input[name="email"]').fill(email)
    await page.locator('input[name="phone"]').fill('2105550100')
    await page.locator('input[name="businessName"]').fill('E2E Test Co')
    await page.getByRole('combobox').filter({ hasText: /Select Industry|Industry/ }).first().click()
    await page.getByRole('option', { name: 'Technology' }).click()
    // Business address block: several inputs elsewhere on the page share these names,
    // so the placeholders Stripe-style are the reliable handle.
    await page.getByPlaceholder('Street Address').fill('100 Test St')
    await page.getByPlaceholder('San Antonio').fill('San Antonio')
    await page.getByPlaceholder('TX').fill('TX')
    await page.getByPlaceholder('78205').fill('78201')
    await page.locator('input[name="businessPhone"]').fill('2105550101')
    await page.getByPlaceholder(/Briefly describe your business/).fill('End-to-end test business.')
    await page.getByRole('button', { name: 'Next', exact: true }).last().click()

    // Step 3: pay.
    // Meeting Member is $149; the button quotes it.
    const pay = page.getByRole('button', { name: 'Pay $149.00' })
    await fillStripeCard(page, CARDS.ok)
    await expect(pay).toBeEnabled()
    await pay.click()

    await page.waitForURL(/\/payment\/success\?type=membership&paymentId=pi_/, { timeout: 60_000 })
    const paymentIntentId = new URL(page.url()).searchParams.get('paymentId')!
    await expect(page.getByText(/membership is now active|thank you for joining/i)).toBeVisible()

    const delivered = await deliverWebhook(request, baseURL!, paymentIntentId, 'payment_intent.succeeded')
    expect(delivered.status, delivered.body).toBe(200)

    const user = await db().user.findUnique({ where: { email }, include: { member: true } })
    expect(user, 'the webhook creates the account for a guest join').not.toBeNull()
    expect(user!.role).toBe('MEMBER')
    expect(user!.member?.membershipStatus).toBe('ACTIVE')
    expect(user!.member?.membershipTier).toBe('MEETING_MEMBER')
    expect(user!.member?.renewalDate).not.toBeNull()
  })
})
