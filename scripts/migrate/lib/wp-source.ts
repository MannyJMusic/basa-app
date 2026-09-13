/**
 * Loads the parts of a WordPress dump the importers need, into memory.
 *
 * A mysqldump lists tables alphabetically, so `wp_postmeta` is written before
 * `wp_posts` and meta cannot be filtered by post id in a single pass. This makes
 * two passes: the first collects posts, terms and options, the second collects
 * the meta belonging to the posts the first pass kept.
 */
import { scanDump, Row } from './mysqldump'

export interface WpPost {
  id: number
  type: string
  status: string
  title: string
  slug: string
  content: string
  excerpt: string
  date: string
  modified: string
  parent: number
  guid: string
  mimeType: string
}

export interface WpTerm {
  id: number
  taxonomy: string
  name: string
  slug: string
  count: number
  meta: Record<string, string>
}

export interface WpSource {
  posts: Map<number, WpPost>
  postsByType: Map<string, WpPost[]>
  /** meta_key -> meta_value, last value wins for the handful of repeated keys */
  meta: Map<number, Record<string, string>>
  terms: Map<number, WpTerm>
  termsByTaxonomy: Map<string, WpTerm[]>
  /** post id -> term ids, across every taxonomy */
  termsOfPost: Map<number, number[]>
  options: Record<string, string>
}

export interface LoadOptions {
  /** Post types to keep. Everything else is discarded as it streams past. */
  postTypes: string[]
  /** Option names worth keeping; the options table is mostly transients. */
  options?: string[]
  /**
   * Extra tables to collect during the first pass, for data that is neither a
   * post nor a term - MEC's materialized occurrence dates, for instance. Handlers
   * run in dump order.
   */
  extraTables?: Record<string, (row: Row) => void>
}

const num = (v: string | null): number => (v === null ? 0 : parseInt(v, 10) || 0)

export async function loadWordPress(dumpPath: string, opts: LoadOptions): Promise<WpSource> {
  const wantedTypes = new Set(opts.postTypes)
  const wantedOptions = new Set(opts.options ?? [])

  const posts = new Map<number, WpPost>()
  const terms = new Map<number, WpTerm>()
  const termIdByTaxonomyId = new Map<number, number>()
  const termsOfPost = new Map<number, number[]>()
  const options: Record<string, string> = {}

  // Terms and their taxonomies live in three tables that only join up once all
  // of them have been read, so relationships are buffered and resolved after.
  const termNames = new Map<number, { name: string; slug: string }>()
  const termMeta = new Map<number, Record<string, string>>()
  const taxonomies: { termId: number; taxonomyId: number; taxonomy: string; count: number }[] = []
  const relationships: { objectId: number; taxonomyId: number }[] = []

  await scanDump(dumpPath, {
    ...(opts.extraTables ?? {}),
    wp_posts: (r) => {
      const type = r.post_type ?? ''
      if (!wantedTypes.has(type)) return
      const id = num(r.ID)
      posts.set(id, {
        id,
        type,
        status: r.post_status ?? '',
        title: r.post_title ?? '',
        slug: r.post_name ?? '',
        content: r.post_content ?? '',
        excerpt: r.post_excerpt ?? '',
        date: r.post_date ?? '',
        modified: r.post_modified ?? '',
        parent: num(r.post_parent),
        guid: r.guid ?? '',
        mimeType: r.post_mime_type ?? '',
      })
    },
    wp_terms: (r) => {
      termNames.set(num(r.term_id), { name: r.name ?? '', slug: r.slug ?? '' })
    },
    wp_termmeta: (r) => {
      const id = num(r.term_id)
      const existing = termMeta.get(id) ?? {}
      existing[r.meta_key ?? ''] = r.meta_value ?? ''
      termMeta.set(id, existing)
    },
    wp_term_taxonomy: (r) => {
      taxonomies.push({
        termId: num(r.term_id),
        taxonomyId: num(r.term_taxonomy_id),
        taxonomy: r.taxonomy ?? '',
        count: num(r.count),
      })
    },
    wp_term_relationships: (r) => {
      relationships.push({ objectId: num(r.object_id), taxonomyId: num(r.term_taxonomy_id) })
    },
    wp_options: (r) => {
      const name = r.option_name ?? ''
      if (wantedOptions.has(name)) options[name] = r.option_value ?? ''
    },
  })

  for (const t of taxonomies) {
    const names = termNames.get(t.termId)
    if (!names) continue
    terms.set(t.termId, {
      id: t.termId,
      taxonomy: t.taxonomy,
      name: names.name,
      slug: names.slug,
      count: t.count,
      meta: termMeta.get(t.termId) ?? {},
    })
    termIdByTaxonomyId.set(t.taxonomyId, t.termId)
  }

  for (const rel of relationships) {
    if (!posts.has(rel.objectId)) continue
    const termId = termIdByTaxonomyId.get(rel.taxonomyId)
    if (termId === undefined) continue
    const list = termsOfPost.get(rel.objectId) ?? []
    list.push(termId)
    termsOfPost.set(rel.objectId, list)
  }

  const meta = new Map<number, Record<string, string>>()
  await scanDump(dumpPath, {
    wp_postmeta: (r) => {
      const postId = num(r.post_id)
      if (!posts.has(postId)) return
      const existing = meta.get(postId) ?? {}
      existing[r.meta_key ?? ''] = r.meta_value ?? ''
      meta.set(postId, existing)
    },
  })

  const postsByType = new Map<string, WpPost[]>()
  for (const post of Array.from(posts.values())) {
    const list = postsByType.get(post.type) ?? []
    list.push(post)
    postsByType.set(post.type, list)
  }

  const termsByTaxonomy = new Map<string, WpTerm[]>()
  for (const term of Array.from(terms.values())) {
    const list = termsByTaxonomy.get(term.taxonomy) ?? []
    list.push(term)
    termsByTaxonomy.set(term.taxonomy, list)
  }

  return { posts, postsByType, meta, terms, termsByTaxonomy, termsOfPost, options }
}

/** Post meta for one post, or an empty record. Saves a `?? {}` at every call. */
export function metaOf(src: WpSource, postId: number): Record<string, string> {
  return src.meta.get(postId) ?? {}
}
