/**
 * Thumbnails for images the app stores itself (#274). `storeImage` writes
 * `/uploads/<kind>/<name>.<ext>` plus a 480px WebP at `/uploads/<kind>/thumbs/<name>.webp`.
 * Imported WordPress images have no thumbnail, so callers fall back to the original.
 */
const STORED = /^(.*\/uploads\/(?:flyers|events|venues))\/([^/]+)\.(?:png|jpe?g|gif|webp)$/i

export const THUMB_WIDTH = 480

/** The thumbnail URL for an image this app stored, or null when it has none. */
export function thumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const m = STORED.exec(url)
  return m ? `${m[1]}/thumbs/${m[2]}.webp` : null
}
