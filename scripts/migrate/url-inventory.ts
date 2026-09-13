/**
 * Every public URL the WordPress site answers on, and where it should go after
 * cutover (#70, #71).
 *
 *   pnpm migrate:urls                      # summary + write docs/REDIRECTS.md
 *   pnpm migrate:urls --nginx out.conf     # also emit the nginx map to a file
 *
 * Reads the same mysqldump as the other importers, so the inventory is reproducible
 * and survives the site being switched off.
 *
 * Why this matters: those URLs have inbound links and search traffic. Cutting over
 * without a map throws that away and breaks every link anyone has ever shared.
 */
import { writeFileSync } from 'fs'
import { loadWordPress, WpSource, WpPost } from './lib/wp-source'
import { decodeEntities, collapseWhitespace } from './lib/text'
import { parseArgs } from './lib/report'
import { newestDumpPath } from './lib/dump-path'

/** What happens to a URL at cutover. */
type Disposition =
  | { kind: 'redirect'; to: string; why: string }
  | { kind: 'gone'; why: string }

interface Entry {
  /** The URL as WordPress publishes it, percent-encoding and all. */
  url: string
  type: string
  title: string
  disposition: Disposition
}

/**
 * The form nginx will actually compare against.
 *
 * `$uri` is the *decoded*, normalised path, so a map keyed on `%f0%9f%8e%84` never
 * matches a request for that emoji - nginx has already turned it back into bytes by
 * the time the map is consulted. 19 of this site's slugs are percent-encoded.
 *
 * Destinations keep the encoded form, because that is what the importer stored in
 * `Event.slug` and therefore what basa-app's own route expects.
 */
function matchKey(url: string): string {
  try {
    return decodeURIComponent(url)
  } catch {
    return url // malformed escapes: leave it alone rather than throw
  }
}

const redirect = (to: string, why: string): Disposition => ({ kind: 'redirect', to, why })
const gone = (why: string): Disposition => ({ kind: 'gone', why })

/**
 * Pages, mapped by slug.
 *
 * The dropped features (#35) have no equivalent, so they go to the nearest page that
 * is actually useful rather than nowhere: membership plumbing to the membership
 * pages, the shop to membership (memberships were the only thing really sold),
 * perks to resources. Community pages are the exception - see below.
 */
const PAGE_MAP: Record<string, Disposition> = {
  // Auth
  'login': redirect('/auth/sign-in', 'equivalent page'),
  'register': redirect('/auth/sign-up', 'equivalent page'),
  'password-recover': redirect('/auth/forgot-password', 'equivalent page'),
  'password-reset': redirect('/auth/reset-password', 'equivalent page'),

  // Membership (PMPro)
  'membership-account': redirect('/dashboard', 'equivalent page'),
  'membership-levels': redirect('/membership/pricing', 'equivalent page'),
  'membership-checkout': redirect('/membership/join', 'equivalent page'),
  'membership-billing': redirect('/dashboard', 'billing lives in the dashboard now'),
  'membership-cancel': redirect('/dashboard', 'billing lives in the dashboard now'),
  'membership-confirmation': redirect('/membership', 'no per-order page; the section index is the nearest thing'),
  'membership-invoice': redirect('/dashboard', 'billing lives in the dashboard now'),
  'your-profile': redirect('/dashboard', 'equivalent page'),

  // Events
  'calendar': redirect('/events/calendar', 'equivalent page'),

  // Content
  'news': redirect('/blog', 'the section index; the posts themselves are gone, see below'),
  'podcasts': redirect('/blog', 'nearest section until news is rescoped'),

  // Commerce, dropped (#35)
  'shop': redirect('/membership', 'shop dropped; memberships were the only thing really sold'),
  'cart': redirect('/membership', 'shop dropped'),
  'checkout': redirect('/membership/join', 'shop dropped; joining is the remaining checkout'),
  'my-account': redirect('/dashboard', 'equivalent page'),

  // Perks, dropped (#35)
  'adverts': redirect('/resources', 'perks dropped; resources is the nearest section'),
  'perks': redirect('/resources', 'perks dropped; resources is the nearest section'),

  // Community, dropped entirely (#35)
  'activity': redirect('/', 'community dropped; no equivalent anywhere'),
  'profile': redirect('/dashboard', 'the member’s own page is the dashboard now'),
  'members': redirect('/dashboard', 'directory lives behind sign-in now'),
  'groups': redirect('/', 'community dropped; no equivalent anywhere'),
  'messages': redirect('/', 'community dropped; no equivalent anywhere'),

  // PeepSo left duplicate pages behind at -2 slugs
  'activity-2': redirect('/', 'community dropped; duplicate PeepSo page'),
  'groups-2': redirect('/', 'community dropped; duplicate PeepSo page'),
  'members-2': redirect('/dashboard', 'directory lives behind sign-in now'),
  'notifications': redirect('/dashboard', 'community dropped; the dashboard is the nearest thing'),
  'search': redirect('/', 'no site-wide search in basa-app'),

  // BadgeOS internals. These are plugin plumbing - an assertion or evidence page is
  // meaningless without BadgeOS - so there is nothing to point them at.
  'assertion-page': gone('BadgeOS plumbing; badges dropped (#35)'),
  'badge-page': gone('BadgeOS plumbing; badges dropped (#35)'),
  'evidence-page': gone('BadgeOS plumbing; badges dropped (#35)'),
  'issuer-page': gone('BadgeOS plumbing; badges dropped (#35)'),

  // Boilerplate
  'privacy-policy': redirect('/', 'NO EQUIVALENT - basa-app has no privacy policy page'),
  'refund_returns': redirect('/contact', 'NO EQUIVALENT - basa-app has no refund policy page'),
  'external-link': gone('a PeepSo interstitial, meaningless off that plugin'),
}

/** Sub-pages that WordPress serves under a mapped parent. */
const PATH_MAP: Record<string, Disposition> = {
  '/adverts/add/': redirect('/resources', 'perks dropped (#35)'),
  '/adverts/manage/': redirect('/resources', 'perks dropped (#35)'),
}

/** Full path of a page, following the parent chain WordPress nests them under. */
function pagePath(src: WpSource, post: WpPost): string {
  const parts = [post.slug]
  let parent = post.parent
  const seen = new Set<number>([post.id])
  while (parent && !seen.has(parent)) {
    seen.add(parent)
    const p = src.posts.get(parent)
    if (!p) break
    parts.unshift(p.slug)
    parent = p.parent
  }
  return `/${parts.join('/')}/`
}

const title = (p: WpPost) => collapseWhitespace(decodeEntities(p.title)) || p.slug

function build(src: WpSource): Entry[] {
  const entries: Entry[] = []
  const frontPageId = parseInt(src.options.page_on_front ?? '', 10)
  const published = (type: string) =>
    (src.postsByType.get(type) ?? []).filter((p) => p.status === 'publish')

  for (const p of published('page')) {
    if (p.id === frontPageId) {
      entries.push({ url: '/', type: 'page', title: title(p), disposition: redirect('/', 'front page') })
      continue
    }
    const path = pagePath(src, p)
    entries.push({
      url: path,
      type: 'page',
      title: title(p),
      disposition: PATH_MAP[path] ?? PAGE_MAP[p.slug] ?? redirect('/', 'UNMAPPED - needs a decision'),
    })
  }

  // Events keep their WordPress slug through the import, so these map one to one.
  for (const p of published('mec-events')) {
    entries.push({
      url: `/events/${p.slug}/`,
      type: 'event',
      title: title(p),
      disposition: redirect(`/events/${p.slug}`, 'slug preserved by the importer'),
    })
  }

  // News. 2,418 of these are Feedzy-syndicated articles BASA does not own and did
  // not write; there is no destination, and 301ing them all at one page is a soft
  // 404 that search engines treat as deception. 410 says the true thing.
  for (const p of published('post')) {
    const cats = (src.termsOfPost.get(p.id) ?? [])
      .map((t) => src.terms.get(t))
      .filter((t) => t?.taxonomy === 'category')
      .map((t) => t!.name)
    const syndicated = cats.includes('San Antonio News')
    entries.push({
      url: `/${p.slug}/`,
      type: syndicated ? 'post (syndicated)' : 'post (BASA)',
      title: title(p),
      disposition: syndicated
        ? gone('syndicated RSS content, not BASA’s and not migrated (#35)')
        : redirect('/blog', 'BASA-authored; no destination until news is rescoped'),
    })
  }

  for (const p of published('product')) {
    entries.push({
      url: `/product/${p.slug}/`,
      type: 'product',
      title: title(p),
      disposition: redirect('/membership/pricing', 'WooCommerce dropped; these were membership products'),
    })
  }

  // WordPress allows two published pages to end up on the same path - PeepSo left
  // three pages all slugged "notifications". Duplicate keys make nginx refuse to
  // load the map entirely, so collapse them here and say so rather than emitting a
  // config that will not start.
  const seen = new Map<string, Entry>()
  const collisions: string[] = []
  for (const e of entries) {
    if (seen.has(e.url)) collisions.push(e.url)
    else seen.set(e.url, e)
  }
  if (collisions.length) {
    const unique = Array.from(new Set(collisions))
    console.log(
      `\n${collisions.length} duplicate URL(s) collapsed (WordPress had more than one page ` +
      `on the same path): ${unique.join(', ')}`
    )
  }

  return Array.from(seen.values()).sort(
    (a, b) => a.type.localeCompare(b.type) || a.url.localeCompare(b.url)
  )
}

/** Longest map key, in bytes - nginx sizes its hash buckets in bytes, not characters. */
function longestKey(entries: Entry[]): number {
  return entries.reduce((max, e) => Math.max(max, Buffer.byteLength(matchKey(e.url), 'utf8')), 0)
}

/** Next power of two that fits the longest key; nginx requires a power of two. */
function bucketSize(entries: Entry[]): number {
  let size = 64
  while (size < longestKey(entries)) size *= 2
  return size
}

/**
 * Hash table size. Too tight and nginx still starts but warns "could not build
 * optimal map_hash" on every reload, which is exactly the kind of standing warning
 * that trains people to ignore the log. Generous is cheap - this is a hash built
 * once at startup.
 */
function maxSize(entries: Entry[]): number {
  let size = 2048
  while (size < entries.length * 8) size *= 2
  return size
}

function nginxConf(entries: Entry[]): string {
  const esc = (s: string) => s.replace(/"/g, '\\"')
  const redirects = entries.filter((e) => e.disposition.kind === 'redirect')
  const gones = entries.filter((e) => e.disposition.kind === 'gone')

  return [
    '# Generated by scripts/migrate/url-inventory.ts - do not edit by hand.',
    '#',
    '# This file belongs in the HTTP context, not a server block: `map` is only valid',
    '# there. On CloudPanel, drop it in /etc/nginx/conf.d/ and it is included already.',
    '#',
    '# Then add these two lines inside the server block for businessassociationsa.com:',
    '#',
    '#     if ($basa_gone)            { return 410; }',
    '#     if ($basa_redirect != "")  { return 301 $basa_redirect; }',
    '#',
    '# Keys are matched against $uri, which nginx has already percent-decoded, so they',
    '# are stored decoded. Destinations keep the encoded slug, which is what the',
    '# importer wrote to Event.slug and what basa-app routes on.',
    '',
    '# Sized from the data. Without these nginx refuses to start with',
    '# "could not build map_hash, you should increase map_hash_bucket_size" - the',
    `# longest key here is ${longestKey(entries)} bytes, against a default bucket of 64.`,
    `map_hash_bucket_size ${bucketSize(entries)};`,
    `map_hash_max_size ${maxSize(entries)};`,
    '',
    'map $uri $basa_redirect {',
    '    default "";',
    ...redirects.map((e) => `    "${esc(matchKey(e.url))}" "${esc((e.disposition as any).to)}";`),
    '}',
    '',
    'map $uri $basa_gone {',
    '    default 0;',
    ...gones.map((e) => `    "${esc(matchKey(e.url))}" 1;`),
    '}',
    '',
  ].join('\n')
}

function report(entries: Entry[]): string {
  const byType = new Map<string, Entry[]>()
  for (const e of entries) {
    byType.set(e.type, [...(byType.get(e.type) ?? []), e])
  }
  const unmapped = entries.filter((e) => e.disposition.kind === 'redirect' && (e.disposition as any).why.startsWith('UNMAPPED'))
  const gones = entries.filter((e) => e.disposition.kind === 'gone')

  const lines: string[] = [
    '# WordPress redirect map',
    '',
    '**Generated** by `pnpm migrate:urls` from the production dump. Do not edit by hand —',
    'change `scripts/migrate/url-inventory.ts` and regenerate.',
    '',
    'Every public URL `businessassociationsa.com` answers on today, and where it goes when',
    'the domain points at basa-app (#70, #71). Those URLs carry inbound links and search',
    'traffic; cutting over without this throws that away.',
    '',
    '## Summary',
    '',
    '| Type | URLs | 301 | 410 |',
    '|---|---|---|---|',
  ]
  const typed = Array.from(byType.entries()).sort((a, b) => b[1].length - a[1].length)
  for (const [type, list] of typed) {
    const r = list.filter((e: Entry) => e.disposition.kind === 'redirect').length
    lines.push(`| ${type} | ${list.length} | ${r} | ${list.length - r} |`)
  }
  lines.push(`| **total** | **${entries.length}** | **${entries.length - gones.length}** | **${gones.length}** |`, '')

  const syndicated = (byType.get('post (syndicated)') ?? []).length
  lines.push(
    '## The one big decision',
    '',
    `${gones.length} URLs return **410 Gone** rather than redirecting. ${syndicated} of them are the`,
    'Feedzy-syndicated "San Antonio News" posts — articles BASA neither wrote nor owns, which were never going to',
    'be migrated (#35). Redirecting thousands of them to a single page is a soft 404: search',
    'engines treat a redirect to irrelevant content as deception, and it can drag down the pages',
    'that do matter. 410 says the true thing — this is gone, stop asking.',
    '',
    `The remaining ${gones.length - syndicated} are plugin internals — BadgeOS assertion/evidence pages and a`,
    'PeepSo interstitial — which mean nothing without the plugin that served them.',
    '',
    'The 4 genuinely BASA-authored posts (3 podcasts, 1 BASA News) redirect to `/blog` instead,',
    'and are listed below so they can be re-pointed once the news feature is rescoped.',
    '',
  )

  if (unmapped.length) {
    lines.push('## Needs a decision', '', 'These have no rule yet and currently fall back to `/`:', '')
    unmapped.forEach((e) => lines.push(`- \`${e.url}\` — ${e.title}`))
    lines.push('')
  }

  lines.push('## Pages', '', '| URL | Goes to | Why |', '|---|---|---|')
  for (const e of byType.get('page') ?? []) {
    const d = e.disposition
    lines.push(`| \`${e.url}\` | ${d.kind === 'gone' ? '**410**' : `\`${d.to}\``} | ${d.why} |`)
  }
  lines.push('')

  const basaPosts = byType.get('post (BASA)') ?? []
  if (basaPosts.length) {
    lines.push('## BASA-authored posts', '', '| URL | Title | Goes to |', '|---|---|---|')
    basaPosts.forEach((e) => lines.push(`| \`${e.url}\` | ${e.title} | \`${(e.disposition as any).to}\` |`))
    lines.push('')
  }

  lines.push(
    '## Events, products and syndicated posts',
    '',
    `${(byType.get('event') ?? []).length} event URLs map one to one — the importer preserves the WordPress`,
    'slug, so `/events/<slug>/` becomes `/events/<slug>`.',
    '',
    `${(byType.get('product') ?? []).length} WooCommerce product URLs go to \`/membership/pricing\`; they were membership`,
    'products, and the shop is dropped (#35).',
    '',
    'The syndicated posts are not listed individually here — there are thousands, and they are all',
    'the same disposition. `pnpm migrate:urls --nginx <file>` emits every one of them.',
    '',
    '## Applying it',
    '',
    '```bash',
    'pnpm migrate:urls --nginx redirects.conf',
    '```',
    '',
    'The file holds two `map` blocks, which are only valid in the **http** context - on CloudPanel,',
    '`/etc/nginx/conf.d/` is included there already. Then add two lines inside the `server` block',
    'for `businessassociationsa.com`:',
    '',
    '```nginx',
    'if ($basa_gone)            { return 410; }',
    'if ($basa_redirect != "")  { return 301 $basa_redirect; }',
    '```',
    '',
    'Lookup is a hash, not thousands of sequential regex tests.',
    '',
    'Keys are stored **decoded**, because nginx matches `$uri` after percent-decoding it - 19 of',
    'these slugs contain encoded emoji and would silently never match otherwise. Destinations keep',
    'the encoded slug, which is what the importer wrote to `Event.slug`.',
    '',
    '**Test after cutover, not before** — before it, every one of these still resolves to WordPress',
    'and proves nothing.',
    '',
  )
  return lines.join('\n')
}

async function main(): Promise<void> {
  const { values } = parseArgs(process.argv.slice(2))
  const dumpPath = values.dump ?? newestDumpPath()
  console.log(`Reading ${dumpPath}`)

  const src = await loadWordPress(dumpPath, {
    postTypes: ['page', 'post', 'mec-events', 'product'],
    options: ['permalink_structure', 'siteurl', 'home', 'page_on_front', 'show_on_front'],
  })

  const entries = build(src)
  const gones = entries.filter((e) => e.disposition.kind === 'gone').length
  const unmapped = entries.filter(
    (e) => e.disposition.kind === 'redirect' && (e.disposition as any).why.startsWith('UNMAPPED')
  )

  writeFileSync('docs/REDIRECTS.md', `${report(entries)}`)
  console.log(`\n${entries.length} public URLs: ${entries.length - gones} redirect, ${gones} gone`)
  if (unmapped.length) {
    console.log(`\n${unmapped.length} URL(s) have no rule and fall back to "/":`)
    unmapped.forEach((e) => console.log(`  ${e.url}`))
  }
  console.log('\nWrote docs/REDIRECTS.md')

  if (values.nginx) {
    writeFileSync(values.nginx, nginxConf(entries))
    console.log(`Wrote ${values.nginx}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
