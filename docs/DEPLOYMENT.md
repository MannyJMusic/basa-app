# Deployment

Merges the former `DEPLOYMENT_ARCHITECTURE.md`, `CI_CD_DEPLOYMENT_GUIDE.md`, `SSH_DEPLOYMENT_SETUP.md`, `DEPLOYMENT_TROUBLESHOOTING.md`, and `DOCKER.md`. Those described a two-server (dev + prod) architecture with per-environment scripts; that setup is not what the current pipeline runs, so this doc describes what actually happens today. See `CLAUDE.md` for the day-to-day command reference and Branching policy.

## Architecture

One production host: a Hostinger VPS running CloudPanel (nginx reverse proxy + SSL) in front of a Docker Compose stack (Next.js + PostgreSQL + Prisma Studio), defined in `docker-compose.prod.yml`. There is currently no automated deploy target other than this host — `docker-compose.dev.yml` exists for running a local/remote Docker stack by hand, but nothing in CI builds or deploys it.

```
GitHub (push to main) → GitHub Actions → SSH → /opt/basa-app on the VPS → docker compose (prod)
                                                        ↓
                                         CloudPanel (nginx + Let's Encrypt) → app.businessassociationsa.com
```

As of Phase 2 of `.claude/PLAN.md`, CloudPanel is not yet configured for the app subdomain — TLS fails there today. This doc describes the deploy mechanism; getting it actually serving traffic is tracked separately.

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

## Troubleshooting

- **`fatal: detected dubious ownership in repository`** — `git config --global --add safe.directory /opt/basa-app` on the server.
- **Divergent branches on the server** — the deploy step already does `git fetch origin && git reset --hard origin/main`; if running that by hand, use the same host branch name the workflow deploys (`main`).
- **Health check keeps failing after deploy** — `docker compose -f docker-compose.prod.yml logs basa-app`, then check `docker compose ... exec basa-app printenv | grep DATABASE_URL` for a bad connection string, and confirm migrations applied (step 5 above is best-effort and swallows failures).
- **Port or disk issues on the host** — `netstat -tlnp | grep :3000` for conflicts, `df -h` for space.

## Local Docker development

```bash
docker compose -f docker-compose.local.yml up -d
# App:           http://localhost:3000
# Prisma Studio: http://localhost:5555
# PostgreSQL:    localhost:5432
```

`docker-compose.dev.yml` is the same shape pointed at `.env.development`, for anyone who wants a container-based dev environment instead of `pnpm dev` directly; it is not part of the CI/CD path.
