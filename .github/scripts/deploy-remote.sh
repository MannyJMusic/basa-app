#!/bin/bash
# Runs on the production server via: ssh user@host 'bash -s' < this-file
# No GitHub secret interpolation happens inside this file - it is piped
# to the remote bash as-is over stdin, which avoids the whole class of
# quoting/interpolation bugs that come from mixing ${{ secrets.* }}
# substitution with multi-line quoted strings directly in the workflow YAML.
set -euo pipefail

APP_DIR=/opt/basa-app
COMPOSE="docker compose --env-file .env.production -f docker-compose.prod.yml"
HEALTH_URL=http://localhost:3000/api/health
# Must match the `image:` key on the basa-app service in docker-compose.prod.yml,
# otherwise a rollback retags something compose never looks at.
APP_IMAGE=basa-app:current
ROLLBACK_TAG=basa-app:rollback

cd "$APP_DIR"

# Defined before anything can call it: bash resolves function names at call time,
# so a rollback() defined further down would be "command not found" for an early
# failure - exactly when it matters most.
rollback() {
  echo "=== DEPLOY FAILED: $1 ==="
  if [ -z "${PREVIOUS_IMAGE:-}" ]; then
    echo "No rollback point exists. The site needs manual attention."
    exit 1
  fi
  echo "Rolling back to $PREVIOUS_IMAGE..."
  docker tag "$ROLLBACK_TAG" "$APP_IMAGE"
  $COMPOSE up -d --force-recreate basa-app
  for i in $(seq 1 12); do
    if curl -fsS -o /dev/null "$HEALTH_URL"; then
      echo "Rollback healthy: the previous build is serving again."
      exit 1
    fi
    sleep 5
  done
  echo "Rollback did NOT become healthy. The site needs manual attention."
  exit 1
}

echo "=== Starting Deployment ==="

# An interrupted deploy - a dropped ssh session, a cancelled CI run - leaves the
# checkout advanced to the new commit while the old container keeps serving. That
# is a safe state, not a broken one, but it is worth naming: the alternative is
# someone finding a host whose git log disagrees with what is running and assuming
# the worst. Re-running the deploy is the fix, and this says so out loud.
RUNNING_IMAGE="$(docker inspect --format '{{.Image}}' basa-app-prod 2>/dev/null || true)"
TAGGED_IMAGE="$(docker image inspect --format '{{.Id}}' "$APP_IMAGE" 2>/dev/null || true)"
HEAD_BEFORE="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
if [ -n "$RUNNING_IMAGE" ] && [ -n "$TAGGED_IMAGE" ] && [ "$RUNNING_IMAGE" != "$TAGGED_IMAGE" ]; then
  echo "NOTE: the running container is not built from $APP_IMAGE."
  echo "      A previous deploy was probably interrupted. This run supersedes it."
fi
echo "Checkout was at $HEAD_BEFORE before this deploy."

# The image the currently-running app container is built from. If the new build
# turns out to be unhealthy we retag this back into place, so a bad deploy costs
# one container restart rather than leaving the site down until someone notices.
# Empty on the very first deploy, when there is nothing to roll back to.
PREVIOUS_IMAGE="$(docker inspect --format '{{.Image}}' basa-app-prod 2>/dev/null || true)"
if [ -n "$PREVIOUS_IMAGE" ]; then
  docker tag "$PREVIOUS_IMAGE" "$ROLLBACK_TAG"
  echo "Rollback point: $PREVIOUS_IMAGE -> $ROLLBACK_TAG"
else
  echo "No running app container; this deploy has no rollback point."
fi

# Defaults to origin/main, which is what CI deploys. Overridable so a deploy can
# be exercised against a branch without first merging it to main - and so running
# this by hand on a box that is ahead of main does not silently roll it backwards.
DEPLOY_REF="${DEPLOY_REF:-origin/main}"
echo "Pulling latest code ($DEPLOY_REF)..."
git fetch origin
git reset --hard "$DEPLOY_REF"

# No --no-cache. This VPS has 2 CPUs; a cold build takes minutes and the layer
# cache is invalidated by the lockfile and source changes anyway, so discarding
# it bought nothing but a longer outage window.
# --progress=plain for a reason beyond readability: the default progress writer
# buffers, so a multi-minute build sends nothing over the ssh session. On
# 2026-09-09 that idle session was dropped mid-build with "client_loop: send
# disconnect: Broken pipe" - the deploy step failed while the build carried on
# inside dockerd, and every step after it (up, health check, rollback) never ran.
# Plain emits a line per step, so the connection keeps seeing traffic.
#
# Note the build cannot be made to die with the ssh session: the work happens in
# the daemon, not the client. Hence the reconcile step at the top of this script,
# which is what actually makes an interrupted deploy safe to re-run.
echo "Building image..."
if ! $COMPOSE build --progress=plain basa-app; then
  rollback "image build failed"
fi

# Deliberately NOT `down` first. `down` stops Postgres too, so every deploy took
# the database offline and guaranteed an outage. `up -d` recreates only the
# services whose config or image actually changed.
echo "Starting new containers..."
if ! $COMPOSE up -d --remove-orphans; then
  rollback "compose up failed"
fi

# The old version of this loop ran ten attempts and then fell through to
# "Deployment Complete" whether or not any of them succeeded, so a completely
# broken deploy reported success. A deploy that never becomes healthy is a
# failed deploy.
echo "Waiting for the app to become healthy..."
HEALTHY=0
for i in $(seq 1 24); do
  if curl -fsS -o /dev/null "$HEALTH_URL"; then
    echo "Health check passed on attempt $i."
    HEALTHY=1
    break
  fi
  echo "  not healthy yet (attempt $i/24)"
  sleep 5
done

if [ "$HEALTHY" -ne 1 ]; then
  rollback "app never became healthy at $HEALTH_URL"
fi

# Migrations run from scripts/setup-prod.js on container start, which exits
# non-zero and refuses to serve traffic if they fail - so by the time the health
# check above passed, they have already applied. This re-runs `migrate deploy`
# (a no-op when nothing is pending) purely so the deploy log records the schema
# state rather than leaving it only in container logs.
echo "Confirming migration state..."
if ! $COMPOSE exec -T basa-app npx prisma migrate deploy; then
  rollback "migrations failed"
fi

# Only prune once the new build is known good. The rollback tag keeps the previous
# image alive through this; an untagged image would be collected here.
echo "Cleaning up old Docker images..."
docker image prune -f

echo "=== Deployment Complete ==="
