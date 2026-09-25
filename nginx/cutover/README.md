# Cutover kit for businessassociationsa.com (#71)

**Date: to be set by the owner.** (It was planned for Sunday 2026-09-20; the host was suspended and then compromised that weekend, and the kit was refreshed on 2026-09-24 for everything that changed since.) After it, `businessassociationsa.com` *is* basa-app; `www`, `member.` and the old `app.` hostname redirect to it. No DNS changes: every name already points at this host. Nothing here is active until `cutover.sh` runs.

| File | Where it goes | What it is |
|---|---|---|
| `businessassociationsa.com.conf` | `/etc/nginx/sites-enabled/` | The apex vhost: the hardened app vhost (headers, enforced CSP, `Next-Action` block, `/uploads/` type allowlist, `/_next/image` guard, rate limits) on the `basa` certificate, plus the redirect rules; `www` and `member.` 301 to the apex |
| `app.businessassociationsa.com.conf` | `/etc/nginx/sites-enabled/` (replaces the proxying vhost) | `app.` 301s to the apex, except `/api/webhooks/`, which keeps proxying so in-flight Stripe deliveries are not lost |
| `basa-redirects.conf` | `/etc/nginx/basa-redirects.conf` | One exact-match `location` per old WordPress URL. **Generated**, not committed: `pnpm migrate:urls --nginx nginx/cutover/basa-redirects.conf --same-host` from the final dump |
| `cutover.sh` | `/root/cutover/` | Does the switch and runs the checks. `--check` runs only the checks |
| `rollback.sh` | `/root/cutover/` | Puts WordPress back on the public names and the app back on `app.`, using the pre-cutover image, cron file and Stripe URL |

## State on 2026-09-24 (what the refresh was based on)

- WordPress has had **no changes since the 2026-09-14 import**: no new or edited events, posts or pages, no new users, no PMPro orders. The final import should report everything unchanged.
- 15 events exist only in the app (created there, no `wpId`); the importer matches on `wpId` and leaves them alone.
- Stripe has **no active subscriptions**, so nothing recurring depends on WordPress. Two webhook endpoints point at the apex: the app's (`we_1UG1R3…`, `/api/webhooks/stripe`, currently answered by WordPress with a 404) and WooCommerce's (`/?wc-api=wc_stripe`, disable under #72).
- The app runs live Stripe keys; `MEMBERSHIP_SALES_ENABLED=false` (memberships through the office, tickets online).
- The host's cron calls the app on `app.` (stale holds and member-rate expiry every 15 minutes, membership expiry nightly).

## Before the day

- [ ] **Owner: Google OAuth client** (Google Cloud Console → Credentials): add `https://businessassociationsa.com/api/auth/callback/google` to the authorised redirect URIs. Keep the `app.` one until the rollback window has passed. Without it, Google sign-in on the apex fails with `redirect_uri_mismatch`.
- [ ] **Owner: live test of member-rate verification** on `app.` with your own card (buy with "verify me", approve or deny from Admin → Member rate requests). The one money path not yet exercised with a real card.
- [ ] **Owner:** tell whoever posts events that WordPress freezes at the chosen time.
- [ ] Release `dev` → `main` with this kit and the importer change, so the host checkout has them.
- [ ] Rehearse the new apex vhost on a loopback-only port on the host (as on 2026-09-14): `nginx -t`, the headers, a redirect of each kind.

## On the day

```bash
# on the Mac, after WordPress is frozen
./scripts/pull-backups.sh
pnpm migrate:events --images ./media --commit && pnpm migrate:members --commit   # expect "unchanged"
./scripts/push-media.sh ./media
pnpm migrate:urls --nginx nginx/cutover/basa-redirects.conf --same-host
ssh root@31.97.214.26 mkdir -p /root/cutover
scp nginx/cutover/*.conf nginx/cutover/*.sh root@31.97.214.26:/root/cutover/

# on the host
/root/cutover/cutover.sh
```

What `cutover.sh` does, in order:

1. Saves both vhosts, `.env.production`, `/etc/cron.d/basa`, the Stripe endpoint and WordPress's `home`/`siteurl`/`blog_public`.
2. Takes the public names off the WordPress vhost.
3. Installs the rules and the apex vhost, reloads: the apex now serves the app while `app.` still does too.
4. Sets `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the apex in the host's `.env.production`.
5. Runs the ordinary deploy script to **rebuild** (about 20 minutes): `NEXT_PUBLIC_APP_URL` is a build arg compiled into the client bundle, so sign-in redirects, e-mail links, the sitemap and canonical URLs only move with a rebuild. The previous image is kept as `basa-app:rollback`.
6. Swaps the `app.` vhost for the redirecting one.
7. Stripe endpoint: confirms the apex URL and adds `payment_intent.amount_capturable_updated` (member-rate holds). 7b. Points the host's cron jobs at the apex; a redirected `curl -X POST` would otherwise stop them silently.
8. Points WordPress at `srv1152916.hstgr.cloud` with `noindex` for the 60-day fallback.
9. Dry-runs certificate renewal for both certificates.
10. Checks: apex health, events page and an image; sitemap on apex URLs; `www`, `member.` and `app.` redirect; one URL of each redirect disposition; WordPress on its internal name; the enforced CSP and the image guard on the apex; the cron endpoint reachable on the apex; the Stripe endpoint's URL and event.

`rollback.sh` reverses all of it in about a minute, restoring the pre-cutover image, cron file and Stripe URL.

## After the day

- **On the Mac:** set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://businessassociationsa.com` in the local `basa-app/.env.production` too. It is the source of truth for hand edits; a later copy to the host would otherwise undo step 4.
- Replace `nginx/basa-app.conf` in this repo with the two installed vhosts, and update `CLAUDE.md` (the site is `https://businessassociationsa.com`; the Stripe endpoint note).
- Watch `/var/log/nginx/basa-apex.access.log` for 404s that should have been redirects, and Sentry.
- Google Search Console: add the apex property and submit `https://businessassociationsa.com/sitemap.xml`.
- After 60 days: remove the `app.` OAuth redirect URI, disable the WooCommerce Stripe endpoint, take a final WordPress export and remove WordPress (#72). The offsite job's weekly WordPress uploads archive and the WordPress dump in the nightly backup can go with it.

## Why locations and not `map`

`map` is only valid in the http context, and its hash sizes must be declared before the first `map` nginx parses; CloudPanel's `nginx.conf` already has one, so `map_hash_bucket_size` in a later file is rejected as a duplicate and the 147-byte keys here overflow the 64-byte default. Exact-match locations live inside the vhost, need no tuning, and are a binary search over a sorted array. A few thousand cost nothing.
