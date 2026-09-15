# Cutover kit for businessassociationsa.com (#71)

**Friday 2026-09-18 at close of business.** After it, `businessassociationsa.com` *is* basa-app; `www`, `member.` and the old `app.` hostname redirect to it. Portals that come later get their own subdomains (owner, 2026-09-15). Nothing here is active until `cutover.sh` runs.

| File | Where it goes | What it is |
|---|---|---|
| `businessassociationsa.com.conf` | `/etc/nginx/sites-enabled/` | The apex vhost: proxies to the app, serves `/uploads/`, includes the redirect rules; `www` and `member.` 301 to the apex |
| `app.businessassociationsa.com.conf` | `/etc/nginx/sites-enabled/` (replaces the proxying vhost) | `app.` 301s to the apex, except `/api/webhooks/`, which keeps proxying so in-flight Stripe deliveries are not lost |
| `basa-redirects.conf` | `/etc/nginx/basa-redirects.conf` | One exact-match `location` per old WordPress URL. **Generated**, not committed: `pnpm migrate:urls --nginx nginx/cutover/basa-redirects.conf --same-host` from the final dump. `--same-host` drops rules that would redirect a URL to itself |
| `cutover.sh` | `/root/cutover-2026-09-18/` | Does the switch and runs the checks. `--check` runs only the checks |
| `rollback.sh` | `/root/cutover-2026-09-18/` | Puts WordPress back on the public names and the app back on `app.`, using the pre-cutover image |

## Before Friday, once

- **Google OAuth client** (Google Cloud Console → Credentials): add `https://businessassociationsa.com/api/auth/callback/google` to the authorised redirect URIs. Keep the `app.` one until the rollback window has passed. Without this, Google sign-in on the apex fails with `redirect_uri_mismatch`; the app cannot fix that from its side.
- The events poster knows WordPress freezes at COB.

## Friday

```bash
# on the Mac, after WordPress is frozen
./scripts/pull-backups.sh
pnpm migrate:events --images ./media --commit && pnpm migrate:members --commit
./scripts/push-media.sh ./media
pnpm migrate:urls --nginx nginx/cutover/basa-redirects.conf --same-host
scp nginx/cutover/*.conf nginx/cutover/*.sh root@31.97.214.26:/root/cutover-2026-09-18/

# on the host
/root/cutover-2026-09-18/cutover.sh
```

What `cutover.sh` does, in order:

1. Saves both vhosts, `.env.production` and WordPress's `home`/`siteurl`/`blog_public`.
2. Takes the public names off the WordPress vhost.
3. Installs the rules and the apex vhost, reloads: the apex now serves the app while `app.` still does too (NextAuth has `trustHost: true`, so both work).
4. Sets `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the apex.
5. Runs the ordinary deploy script to **rebuild** the image: `NEXT_PUBLIC_APP_URL` is inlined into the client bundle at build time, so sign-in redirects, e-mail links, the sitemap and canonical URLs only move with a rebuild. About 8 minutes; the previous image is kept as `basa-app:rollback`.
6. Swaps the `app.` vhost for the redirecting one.
7. Points the Stripe webhook endpoint at the apex.
8. Points WordPress at `srv1152916.hstgr.cloud` with `noindex`, so the 60-day fallback stays reachable and out of search.
9. Dry-runs certificate renewal for both certificates.
10. Checks: apex health, events page and an image; sitemap lists apex URLs; `www`, `member.` and `app.` redirect; one URL of each redirect disposition; WordPress answers on its internal name.

`rollback.sh` reverses all of it in about a minute, restoring the pre-cutover image so the client bundle points at `app.` again.

## After Friday

- Replace `nginx/basa-app.conf` in this repo with the two installed vhosts so the repo describes the host again.
- Update `CLAUDE.md`'s deployment section: the site is `https://businessassociationsa.com`.
- Watch `/var/log/nginx/basa-apex.access.log` for 404s that should have been redirects.
- Google Search Console: add the apex property and submit `https://businessassociationsa.com/sitemap.xml`.
- After 60 days, remove the `app.` OAuth redirect URI and disable the WooCommerce Stripe endpoint (#72).

## Why locations and not `map`

`map` is only valid in the http context, and its hash sizes must be declared before the first `map` nginx parses; CloudPanel's `nginx.conf` already has one, so `map_hash_bucket_size` in a later file is rejected as a duplicate and the 147-byte keys here overflow the 64-byte default. Exact-match locations live inside the vhost, need no tuning, and are a binary search over a sorted array. A few thousand cost nothing.
