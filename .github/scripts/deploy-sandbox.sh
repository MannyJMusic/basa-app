#!/usr/bin/env bash
# Stream from Actions over SSH (`bash -s -- prebuilt` when CI loaded the image). The sandbox has its own checkout and Compose
# project, so production's deploy can safely use --remove-orphans.
set -euo pipefail

cd /opt/basa-sandbox
test -s .env.sandbox || { echo 'Missing /opt/basa-sandbox/.env.sandbox'; exit 1; }

compose() {
  docker compose --env-file .env.sandbox -f docker-compose.sandbox.yml "$@"
}

echo 'Fetching the reviewed dev branch...'
git fetch origin dev
git reset --hard origin/dev
# A checkout originally created with a restrictive umask can leave files at 0600
# and directories at 0700. Docker COPY preserves those modes, and the unprivileged
# nextjs runtime then cannot read package.json or the application source. Only
# tracked files are made readable; .env.sandbox remains root-only.
git ls-files -z | xargs -0 -r chmod a+r
find . -path './.git' -prune -o -type d -exec chmod a+rx {} +
compose config -q

# Preserve the image that is actually serving, even after an interrupted build
# has moved the sandbox-current tag to a different image.
previous_image="$(docker inspect --format '{{.Image}}' basa-app-sandbox 2>/dev/null || true)"
if [ -n "$previous_image" ]; then
  docker tag "$previous_image" basa-app:sandbox-rollback
fi

echo 'Starting the isolated sandbox database...'
compose up -d postgres

# An interrupted first refresh must never leave an unsanitized database online.
if [ ! -s .sandbox-sanitized ]; then
  compose stop basa-app
fi

# CI builds the image and loads it as basa-app:sandbox-current before this runs
# ("prebuilt"). A manual run on the host, without the argument, builds it here.
if [ "${1:-}" = prebuilt ]; then
  docker image inspect basa-app:sandbox-current >/dev/null
  echo 'Using the image built by CI.'
else
  echo 'Building the sandbox image...'
  compose build --progress=plain basa-app
fi

if [ ! -s .sandbox-sanitized ]; then
  echo 'No sanitized data marker; refreshing before the first app start...'
  exec bash scripts/refresh-sandbox-data.sh
fi

echo 'Starting the sandbox app...'
if compose up -d --no-deps --force-recreate basa-app; then
  for i in $(seq 1 24); do
    if curl -fsS -o /dev/null http://127.0.0.1:3002/api/health; then
      echo 'Sandbox is healthy.'
      docker image prune -f >/dev/null || true
      exit 0
    fi
    sleep 5
  done
  echo 'Sandbox app did not become healthy.'
fi

docker logs --tail 60 basa-app-sandbox 2>&1 || true
if [ -n "$previous_image" ]; then
  echo 'Restoring the previous sandbox image...'
  docker tag basa-app:sandbox-rollback basa-app:sandbox-current
  if ! compose up -d --no-deps --force-recreate basa-app; then
    echo 'Rollback container could not start; inspect basa-app-sandbox.'
    docker logs --tail 60 basa-app-sandbox 2>&1 || true
    exit 1
  fi
  for i in $(seq 1 12); do
    if curl -fsS -o /dev/null http://127.0.0.1:3002/api/health; then
      echo 'Previous sandbox image restored.'
      exit 1
    fi
    sleep 5
  done
  echo 'Rollback did not become healthy; inspect basa-app-sandbox.'
  docker logs --tail 60 basa-app-sandbox 2>&1 || true
else
  echo 'This was the first sandbox deploy; no previous image exists.'
fi
exit 1
