import { test, expect } from '@playwright/test'

/**
 * src/middleware.ts (#138): the signed-in areas deny by default, before any page
 * code runs, while the public site and unknown paths are untouched.
 */
test.describe('Route protection', () => {
  for (const path of ['/admin', '/admin/members/invitations', '/dashboard', '/dashboard/profile', '/dev', '/blog/write']) {
    test(`anonymous ${path} is sent to sign-in`, async ({ request, baseURL }) => {
      const res = await request.get(`${baseURL}${path}?x=1`, { maxRedirects: 0 })
      expect([302, 307]).toContain(res.status())
      const to = new URL(res.headers()['location'], baseURL)
      expect(to.pathname).toBe('/auth/sign-in')
      expect(to.searchParams.get('callbackUrl')).toBe(`${path}?x=1`)
    })
  }

  for (const path of ['/', '/events', '/membership', '/auth/sign-in', '/sitemap.xml', '/robots.txt']) {
    test(`public ${path} is not redirected`, async ({ request, baseURL }) => {
      const res = await request.get(`${baseURL}${path}`, { maxRedirects: 0 })
      expect(res.status()).toBe(200)
    })
  }

  test('an unknown path still 404s instead of asking for sign-in', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/some/old/wordpress-page`, { maxRedirects: 0 })
    expect(res.status()).toBe(404)
  })
})
