/**
 * Server-side image storage for flyers, event images and venue photos (#274).
 * Files go under public/uploads/<kind>, which is the bind-mounted uploads volume in
 * production and is served by nginx. A WebP thumbnail is written beside each one so
 * list pages do not ship multi-megabyte flyers.
 */
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import * as Sentry from "@sentry/nextjs"
import { THUMB_WIDTH } from "@/lib/event-image"

export type UploadKind = "flyers" | "events" | "venues"

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" }
export const UPLOAD_IMAGE_TYPES = Object.keys(EXT)

export interface StoredImage {
  /** Absolute URL of the original. */
  url: string
  /** Absolute URL of the thumbnail, or null if it could not be made. */
  thumbUrl: string | null
}

function origin(requestUrl: string): string {
  const o = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? new URL(requestUrl).origin
  return o.replace(/\/$/, "")
}

/** Returns null if the volume is not writable. */
export async function storeImage(
  data: Buffer,
  originalName: string,
  mediaType: string,
  kind: UploadKind,
  requestUrl: string,
): Promise<StoredImage | null> {
  const ext = EXT[mediaType]
  if (!ext) return null
  const base =
    path
      .basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || kind.slice(0, -1)
  const stem = `${new Date().toISOString().slice(0, 10)}-${base}-${Math.random().toString(36).slice(2, 8)}`
  const dir = path.join(process.cwd(), "public", "uploads", kind)

  try {
    await mkdir(path.join(dir, "thumbs"), { recursive: true })
    await writeFile(path.join(dir, `${stem}.${ext}`), data, { flag: "wx" })
  } catch (error) {
    Sentry.captureException(error)
    return null
  }

  let thumbUrl: string | null = null
  try {
    const sharp = (await import("sharp")).default
    const thumb = await sharp(data).rotate().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer()
    await writeFile(path.join(dir, "thumbs", `${stem}.webp`), thumb, { flag: "wx" })
    thumbUrl = `${origin(requestUrl)}/uploads/${kind}/thumbs/${stem}.webp`
  } catch (error) {
    // The original is still usable; lists fall back to it.
    Sentry.captureException(error)
  }
  return { url: `${origin(requestUrl)}/uploads/${kind}/${stem}.${ext}`, thumbUrl }
}
