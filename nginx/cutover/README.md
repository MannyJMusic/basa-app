# Cutover kit for businessassociationsa.com (#71)

What gets installed on the production host on **Friday 2026-09-18 at close of business**, and the script that does it. Nothing here is active until `cutover.sh` runs.

| File | Where it goes | What it is |
|---|---|---|
| `businessassociationsa.com.conf` | `/etc/nginx/sites-enabled/` | The apex vhost: every old WordPress URL is answered here and sent to basa-app on `app.businessassociationsa.com` |
| `basa-redirects.conf` | `/etc/nginx/basa-redirects.conf` | One exact-match `location` per old URL, included from inside the apex vhost. **Generated**, not committed: `pnpm migrate:urls --nginx nginx/cutover/basa-redirects.conf` from the final dump |
| `cutover.sh` | `/root/cutover-2026-09-18/` | Does the swap and runs the checks. `--check` runs only the checks |
| `rollback.sh` | `/root/cutover-2026-09-18/` | Puts WordPress back on the public names |

## What Friday looks like

```bash
# on the Mac, after WordPress is frozen
./scripts/pull-backups.sh
pnpm migrate:events --images ./media --commit && pnpm migrate:members --commit
./scripts/push-media.sh ./media
pnpm migrate:urls --nginx nginx/cutover/basa-redirects.conf
scp nginx/cutover/*.conf nginx/cutover/*.sh root@31.97.214.26:/root/cutover-2026-09-18/

# on the host
/root/cutover-2026-09-18/cutover.sh
```

`cutover.sh` saves the WordPress vhost and its `home`/`siteurl`/`blog_public` first, takes the public names off the WordPress vhost, installs the two files, reloads nginx, points WordPress at `srv1152916.hstgr.cloud` with `noindex`, confirms certificate renewal still works with a certbot dry run, and then checks: each public hostname redirects to the app, one URL of each disposition behaves, WordPress still answers on its internal name, the app's health check passes.

## Why the apex redirects to `app.` rather than serving the app itself

Serving basa-app on the apex directly means changing `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`, registering a new Google OAuth redirect URI, re-pointing the Stripe webhook, and re-verifying the Mailgun link domain, all on cutover night. Redirecting keeps Friday to nginx only, retires WordPress on schedule, and leaves "move the app to the apex" as a separate step with its own checks. The redirect map destinations are host-relative, so that later move is a one-line change in the vhost.

## Why locations and not `map`

The first version was two `map` blocks. `map` is only valid in the http context, and its hash sizes have to be declared before the first `map` nginx parses; CloudPanel's `nginx.conf` already has one, so `map_hash_bucket_size` in a later file is rejected as a duplicate and the 147-byte keys here overflow the 64-byte default. Exact-match locations live inside the vhost, need no tuning, and are a binary search over a sorted array. 5,400 of them cost nothing.

One thing to remember when the app moves to the apex and `$basa_target` becomes `""`: the rule for `/` then reads `return 301 /`, a loop. Drop that one line from the generated file, or better, teach the generator to skip an identity redirect when the target is empty.
