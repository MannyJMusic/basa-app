/**
 * The one place the site's public origin comes from. From the cutover on
 * 2026-09-18 that is https://businessassociationsa.com; before it, the app
 * ran at https://app.businessassociationsa.com. Both are set through env so a
 * deploy, not a code change, moves the site.
 *
 * NEXT_PUBLIC_APP_URL is inlined into the client bundle at build time, so a
 * change to it needs a rebuild, not just a restart.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  'https://businessassociationsa.com'
).replace(/\/$/, '')
