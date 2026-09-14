/**
 * Where imported WordPress media ends up.
 *
 * `Event.image` and `Venue.image` arrive as `businessassociationsa.com` URLs. Those
 * stop resolving the moment #71 points that domain at basa-app, so with `--images`
 * the importer fetches each file once and stores a local `/uploads/...` path served
 * from the volume bind-mounted at `public/uploads` in production (#111).
 */
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

/** Public path of the uploads volume. Must match docker-compose.prod.yml. */
export const UPLOADS_URL_PREFIX = '/uploads'

export interface Media {
  dir: string
  /** WordPress URL -> file name on disk. */
  manifest: Record<string, string>
  /** URLs that could not be fetched. Their rows get a null image, not a dead link. */
  failed: Set<string>
}

/**
 * On-disk shape of `manifest.json`: URL -> file name, or URL -> null for a file that
 * could not be fetched.
 *
 * Failures have to be remembered, not just successes. Fourteen venue photos are
 * already 404 on WordPress; without recording that, every run would write the dead
 * URL during the sync, null it again afterwards, and report fourteen venues as
 * updated forever.
 */
export type ManifestFile = Record<string, string | null>

/** What to write to `manifest.json`: successes as names, failures as null. */
export function serialiseManifest(media: Media): ManifestFile {
  const out: ManifestFile = { ...media.manifest }
  for (const url of Array.from(media.failed)) {
    if (!(url in media.manifest)) out[url] = null
  }
  return out
}

/**
 * Read back what a previous run fetched.
 *
 * This matters more than it looks. The manifest is consulted *while syncing*, so a
 * second run maps a URL to the same local path instead of recomputing the WordPress
 * URL, writing it over the local one, and reporting every row as changed - which
 * would destroy the idempotency check the importers are held to.
 */
export function loadMedia(dir: string | null): Media | null {
  if (!dir) return null
  const media: Media = { dir, manifest: {}, failed: new Set() }
  const path = join(dir, 'manifest.json')
  if (existsSync(path)) {
    try {
      const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [url, name] of Object.entries(parsed as Record<string, unknown>)) {
          if (typeof name === 'string') media.manifest[url] = name
          else if (name === null) media.failed.add(url)
        }
      }
    } catch {
      // An unreadable manifest is not worth failing a run over: it gets rewritten at
      // the end, and anything missing from it is simply fetched again.
    }
  }
  return media
}

/**
 * What to store in an `image` column for a given WordPress URL.
 *
 * Returns the original URL when media is not being managed, so `--images` stays
 * opt-in and a plain run behaves exactly as it did before.
 *
 * A PDF is never stored as an image. Four of this site's event "featured images" are
 * flyers, and an `<img>` pointing at a PDF renders as a broken image on the event
 * page; the file is kept on disk and reported instead.
 */
export function storedImage(media: Media | null, url: string | null): string | null {
  if (!url) return null
  if (!media) return url
  const name = media.manifest[url]
  if (!name) return media.failed.has(url) ? null : url
  if (isPdf(name)) return null
  return `${UPLOADS_URL_PREFIX}/${name}`
}

export function isPdf(name: string): boolean {
  return name.toLowerCase().endsWith('.pdf')
}

/** The file name a URL is stored under: the last segment, made filesystem-safe. */
export function fileNameFor(url: string): string {
  return url.split('/').slice(-1)[0].replace(/[^A-Za-z0-9._-]/g, '_')
}
