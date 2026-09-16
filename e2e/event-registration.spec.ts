import { test, expect } from '@playwright/test'
import { db, FIXTURE_EVENT } from './helpers/db'
import { CARDS, deliverWebhook, fillStripeCard } from './helpers/stripe'

/**
 * The ticket money path (#65): a guest with no account buys one non-member
 * ticket in the real browser against Stripe test mode, lands on the success page,
 * and the seat is confirmed when the webhook arrives. Then the same flow with a
 * declined card, which must leave nothing confirmed.
 */
test.describe('Event registration', () => {
  test('a guest buys a ticket and the webhook confirms the seat', async ({ page, request, baseURL }) => {
    const email = `e2e-buyer-${Date.now()}@example.com`

    await page.goto(`/events/${FIXTURE_EVENT.slug}/register`)
    await expect(page.getByRole('heading', { name: FIXTURE_EVENT.title })).toBeVisible()

    await page.getByRole('button', { name: `Add one ${FIXTURE_EVENT.guestTier}` }).click()
    await page.locator('#buyer-name').fill('E2E Buyer')
    await page.locator('#buyer-email').fill(email)
    await page.locator('#buyer-company').fill('E2E Test Co')
    await page.getByRole('button', { name: 'Continue to payment' }).click()

    // The server priced the order; the button quotes what will be charged.
    const pay = page.getByRole('button', { name: `Pay $${FIXTURE_EVENT.guestPrice}.00` })
    await fillStripeCard(page, CARDS.ok)
    await expect(pay).toBeEnabled()
    await pay.click()

    await page.waitForURL(/\/payment\/success\?type=event&paymentId=pi_/, { timeout: 60_000 })
    const paymentIntentId = new URL(page.url()).searchParams.get('paymentId')!
    expect(paymentIntentId).toMatch(/^pi_/)

    // The browser is done; the seat is still only held until Stripe tells the app.
    const pending = await db().eventRegistration.findFirst({ where: { paymentIntentId } })
    expect(pending).not.toBeNull()
    expect(pending!.email).toBe(email)
    expect(pending!.status).toBe('PENDING')
    expect(Number(pending!.totalAmount)).toBe(FIXTURE_EVENT.guestPrice)

    const delivered = await deliverWebhook(request, baseURL!, paymentIntentId, 'payment_intent.succeeded')
    expect(delivered.status, delivered.body).toBe(200)

    const confirmed = await db().eventRegistration.findUnique({ where: { id: pending!.id } })
    expect(confirmed!.status).toBe('CONFIRMED')

    // The buyer's ticket page exists, is confirmed, carries the QR code, and its
    // check-in page is behind the admin sign-in.
    const withToken = await db().eventRegistration.findUnique({ where: { id: pending!.id }, select: { ticketToken: true } })
    expect(withToken!.ticketToken).toMatch(/^[a-f0-9]{64}$/)
    await page.goto(`/tickets/${withToken!.ticketToken}`)
    await expect(page.getByRole('heading', { name: FIXTURE_EVENT.title })).toBeVisible()
    await expect(page.getByText('Confirmed', { exact: true })).toBeVisible()
    expect(await page.locator('svg').filter({ has: page.locator('path') }).count()).toBeGreaterThan(0)
    const qr = await request.get(`${baseURL}/tickets/${withToken!.ticketToken}/qr.png`)
    expect(qr.status()).toBe(200)
    expect(qr.headers()['content-type']).toBe('image/png')
    const gated = await request.get(`${baseURL}/admin/check-in/${withToken!.ticketToken}`, { maxRedirects: 0 })
    expect([302, 307]).toContain(gated.status())

    // Redelivery must be harmless.
    const again = await deliverWebhook(request, baseURL!, paymentIntentId, 'payment_intent.succeeded')
    expect(again.status).toBe(200)
    const still = await db().eventRegistration.findUnique({ where: { id: pending!.id } })
    expect(still!.status).toBe('CONFIRMED')
  })

  test('a declined card confirms nothing', async ({ page }) => {
    const email = `e2e-declined-${Date.now()}@example.com`

    await page.goto(`/events/${FIXTURE_EVENT.slug}/register`)
    await page.getByRole('button', { name: `Add one ${FIXTURE_EVENT.memberTier}` }).click()
    await page.locator('#buyer-name').fill('E2E Declined')
    await page.locator('#buyer-email').fill(email)
    await page.getByRole('button', { name: 'Continue to payment' }).click()

    await fillStripeCard(page, CARDS.declined)
    await page.getByRole('button', { name: /^Pay \$/ }).click()

    // Stripe's decline message surfaces in the form; we stay on the page.
    await expect(page.getByText(/declined/i).first()).toBeVisible({ timeout: 30_000 })
    expect(page.url()).not.toContain('/payment/success')

    const reg = await db().eventRegistration.findFirst({ where: { email } })
    expect(reg).not.toBeNull()
    expect(reg!.status).toBe('PENDING')
    expect(await db().eventRegistration.count({ where: { email, status: 'CONFIRMED' } })).toBe(0)
  })
})
