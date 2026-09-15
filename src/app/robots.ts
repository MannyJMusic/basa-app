import type { MetadataRoute } from 'next'
import { SITE_URL as base } from '@/lib/site-url'

/**
 * /robots.txt. Public pages are crawlable; signed-in areas, auth flows and the
 * API are not. The sitemap is what search engines follow after the WordPress
 * cutover redirects them here (#71).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/', '/auth/', '/payment/', '/dev/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
