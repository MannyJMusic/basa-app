# Deployment

Merges the former `DEPLOYMENT_ARCHITECTURE.md`, `CI_CD_DEPLOYMENT_GUIDE.md`, `SSH_DEPLOYMENT_SETUP.md`, `DEPLOYMENT_TROUBLESHOOTING.md`, and `DOCKER.md`. Those described a two-server (dev + prod) architecture with per-environment scripts; that setup is not what the current pipeline runs, so this doc describes what actually happens today. See `CLAUDE.md` for the day-to-day command reference and Branching policy.

## Architecture

One production host: a Hostinger VPS running CloudPanel (nginx reverse proxy + SSL) in front of a Docker Compose stack (Next.js + PostgreSQL + Prisma Studio), defined in `docker-compose.prod.yml`. There is currently no automated deploy target other than this host — `docker-compose.dev.yml` exists for running a local/remote Docker stack by hand, but nothing in CI builds or deploys it.

```
GitHub (push to main) → GitHub Actions → SSH → /opt/basa-app on the VPS → docker compose (prod)
                                                        ↓
                                         CloudPanel (nginx + Let's Encrypt) → app.businessassociationsa.com
```

As of 2026-09-06 `app.businessassociationsa.com` is live behind CloudPanel as a **reverse-proxy site** (`clpctl site:add:reverse-proxy --domainName=app.businessassociationsa.com --reverseProxyUrl='http://127.0.0.1:3000' --siteUser=basaapp ...`, cert via `clpctl lets-encrypt:install:certificate`). If this site ever needs recreating (e.g. after a server rebuild), that's the exact command; CloudPanel does not expose a way to just regenerate a vhost for an existing site record, so a broken one has to be deleted (`clpctl site:delete --domainName=...`) and re-added.

## CI/CD (`.github/workflows/deploy.yml`)

- **Build and Test** runs on every push to `main`/`master` and on every PR into `dev` or `main`: `pnpm install --frozen-lockfile`, `type-check`, `lint`, `next build`.
- **Deploy to Production** runs only on a push to `main`/`master` (never on a PR), after Build and Test passes. It SSHes into the server and, in `/opt/basa-app`:
  1. `git fetch origin && git reset --hard origin/main`
  2. `docker compose -f docker-compose.prod.yml build --no-cache`
  3. `docker compose -f docker-compose.prod.yml down`
  4. `docker compose -f docker-compose.prod.yml up -d`
  5. `docker compose -f docker-compose.prod.yml exec -T basa-app npx prisma migrate deploy` (best-effort)
  6. Polls `http://localhost:3000/api/health` for up to 10 tries

### Required GitHub secrets

| Secret | Purpose |
|---|---|
| `SSH_PRIVATE_KEY` | Deploy key for the server |
| `SERVER_HOST` | Server IP |
| `SERVER_USER` | SSH user (currently `root`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Baked into the build step |
| `SENTRY_AUTH_TOKEN` | Sourcemap upload during build |

There is only one set of these — one server, one environment. A `SERVER_HOST`/`SERVER_USER` pointed at a second (dev) host is not currently wired into the workflow.

## Manual server operations

```bash
ssh root@<SERVER_HOST>
cd /opt/basa-app

docker compose -f docker-compose.prod.yml ps        # status
docker compose -f docker-compose.prod.yml logs -f   # follow logs
docker compose -f docker-compose.prod.yml logs -f basa-app   # one service
docker compose -f docker-compose.prod.yml restart   # restart without rebuilding
```

### Database backup and restore

```bash
# Backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U basa_user basa_prod > backup.sql

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres psql -U basa_user basa_prod < backup.sql
```

A daily backup runs via cron (`0 2 * * * /opt/basa-app/scripts/backup-db.sh`), writing to `backups/` and pruning anything older than 7 days. The script is tracked in this repo (`scripts/backup-db.sh`) but the crontab entry itself lives only on the server (`crontab -e`).

## Troubleshooting

- **`fatal: detected dubious ownership in repository`** — `git config --global --add safe.directory /opt/basa-app` on the server.
- **Divergent branches on the server** — the deploy step already does `git fetch origin && git reset --hard origin/main`; if running that by hand, use the same host branch name the workflow deploys (`main`).
- **Health check keeps failing after deploy** — `docker compose -f docker-compose.prod.yml logs basa-app`, then check `docker compose ... exec basa-app printenv | grep DATABASE_URL` for a bad connection string, and confirm migrations applied (step 5 above is best-effort and swallows failures).
- **Port or disk issues on the host** — `netstat -tlnp | grep :3000` for conflicts, `df -h` for space.
- **Deploy step "succeeds" but nothing changed on the server** — check that the SSH step passes its script as a trailing quoted command to `ssh`, not piped via a heredoc to a bare `ssh host` with no command argument. The latter opens an interactive login shell; on this host, something in that shell's startup (tied to the CloudPanel MOTD) causes the session to close as soon as the piped input starts arriving, before any of it runs — so the heredoc'd commands silently never execute, `ssh` still exits 0, and the workflow step reports success. This is exactly what happened here for an unknown period before 2026-09-06: the server's checkout sat 7 commits behind `origin/main` and no Docker images existed at all, despite a run of "successful" deploys.
- **`ERR_PNPM_PNPM_ENGINE_IDENTITY_UNVERIFIABLE` during `docker compose build`** — the Dockerfiles pin `npm install -g pnpm@9.12.2` to match `package.json`'s `packageManager` field. If this reappears, a newer pnpm major likely changed its lockfile-verification behavior again; re-pin to whatever version `packageManager` specifies.
- **`prisma migrate deploy` fails with P3005 ("database schema is not empty")** — happens when a database was set up via `prisma db push` (no `_prisma_migrations` table) rather than `migrate deploy`. Before doing anything, confirm the live schema actually matches `schema.prisma` with a read-only check: `docker compose -f docker-compose.prod.yml exec -T basa-app npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`. An empty diff means it's safe to baseline: `npx prisma migrate resolve --applied <migration_name>` for each folder under `prisma/migrations`, in order. A non-empty diff means real drift — do not baseline blindly; investigate what's different first.
- **`basa-prisma-studio-prod` crash-loops on `prisma: not found` or a `postinstall`/`preinstall` failure** — `prisma` and `tsx` are devDependencies, and the container's `.env.production`-derived `NODE_ENV=production` makes pnpm skip devDependencies entirely. The compose command works around this with `NODE_ENV=development pnpm install --frozen-lockfile` for the install step only (the running `prisma studio` process itself doesn't care about `NODE_ENV`). Don't use `pnpm add` here to pull in `prisma`/`tsx` after a `--prod` install — `pnpm-lock.yaml` is a single-file bind mount, and pnpm's atomic rename-over-the-lockfile during `add` intermittently fails with `EBUSY` against that kind of mount.

## Local Docker development

```bash
docker compose -f docker-compose.local.yml up -d
# App:           http://localhost:3000
# Prisma Studio: http://localhost:5555
# PostgreSQL:    localhost:5432
```

`docker-compose.dev.yml` is the same shape pointed at `.env.development`, for anyone who wants a container-based dev environment instead of `pnpm dev` directly; it is not part of the CI/CD path.
