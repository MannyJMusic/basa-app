/**
 * Best-effort logo lookup for a venue website (#274): the page's og:image, an
 * apple-touch-icon, or a link rel=icon. Admin-only and server-side, so it refuses
 * anything that resolves to a private address.
 */
import dns from "dns/promises"
import net from "net"

const MAX_HTML = 1_000_000
const MAX_IMAGE = 5 * 1024 * 1024

function isPrivate(ip: string): boolean {
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase()
    return l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168.")
  }
  const [a, b] = ip.split(".").map(Number)
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)
}

async function assertPublic(url: URL): Promise<void> {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) URLs")
  const addrs = await dns.lookup(url.hostname, { all: true })
  if (addrs.length === 0 || addrs.some((a) => isPrivate(a.address))) throw new Error("That address is not public")
}

async function fetchLimited(url: URL, accept: string, limit: number): Promise<{ data: Buffer; type: string; finalUrl: URL }> {
  let current = url
  for (let hop = 0; hop < 4; hop++) {
    await assertPublic(current)
    const res = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { accept, "user-agent": "BASA-venue-logo/1.0" } })
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location")!, current)
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const chunks: Uint8Array[] = []
    let size = 0
    const reader = res.body!.getReader()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) { await reader.cancel(); throw new Error("Too large") }
      chunks.push(value)
    }
    return { data: Buffer.concat(chunks), type: (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase(), finalUrl: current }
  }
  throw new Error("Too many redirects")
}

/** Candidate image URLs in order of preference. */
export function logoCandidates(html: string, base: URL): URL[] {
  const found: { url: string; rank: number }[] = []
  const tag = /<(meta|link)\b[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = tag.exec(html)) !== null) {
    const t = m[0]
    const attr = (n: string) => new RegExp(`${n}\\s*=\\s*["']([^"']+)["']`, "i").exec(t)?.[1]
    if (m[1].toLowerCase() === "meta") {
      const key = attr("property") ?? attr("name")
      const content = attr("content")
      if (content && key && /^(og:image|twitter:image)$/i.test(key)) found.push({ url: content, rank: 1 })
    } else {
      const rel = attr("rel")?.toLowerCase() ?? ""
      const href = attr("href")
      if (!href) continue
      if (rel.includes("apple-touch-icon")) found.push({ url: href, rank: 0 })
      else if (rel.split(/\s+/).includes("icon") || rel.includes("shortcut")) found.push({ url: href, rank: 2 })
    }
  }
  const out: URL[] = []
  for (const f of found.sort((a, b) => a.rank - b.rank)) {
    try { out.push(new URL(f.url.replace(/&amp;/g, "&"), base)) } catch { /* skip */ }
  }
  try { out.push(new URL("/favicon.ico", base)) } catch { /* skip */ }
  return out
}

export async function findLogo(website: string): Promise<{ data: Buffer; type: string; from: string } | null> {
  const page = await fetchLimited(new URL(website), "text/html", MAX_HTML)
  const html = page.data.toString("utf8")
  for (const candidate of logoCandidates(html, page.finalUrl).slice(0, 6)) {
    try {
      const img = await fetchLimited(candidate, "image/*", MAX_IMAGE)
      if (["image/png", "image/jpeg", "image/gif", "image/webp"].includes(img.type) && img.data.length > 200) {
        return { data: img.data, type: img.type, from: candidate.toString() }
      }
    } catch { /* try the next one */ }
  }
  return null
}
