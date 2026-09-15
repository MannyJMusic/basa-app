import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.businessassociationsa.com'

// Regenerated at most hourly; events change rarely and the list is short.
export const revalidate = 3600

const STATIC_PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/events', priority: 0.9, changeFrequency: 'daily' },
  { path: '/events/calendar', priority: 0.7, changeFrequency: 'daily' },
  { path: '/membership', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/membership/pricing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/membership/benefits', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/membership/compare', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/membership/join', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
]

/**
 * /sitemap.xml: the static pages plus every published event, including past
 * ones. The 259 imported events carry inbound links and search history from
 * the WordPress site; the redirect map (#70) points those at these URLs, so
 * they should be discoverable here too.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true, startDate: true },
    orderBy: { startDate: 'desc' },
  })
  const now = Date.now()

  return [
    ...STATIC_PAGES.map((p) => ({
      url: `${base}${p.path}`,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...events.map((e) => ({
      url: `${base}/events/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: (e.startDate.getTime() > now ? 'weekly' : 'yearly') as 'weekly' | 'yearly',
      priority: e.startDate.getTime() > now ? 0.8 : 0.3,
    })),
  ]
}
