#!/usr/bin/env bash
# Refresh the review sandbox from production without writing a raw dump to disk.
# Run as root on the VPS from /opt/basa-sandbox. The app stays stopped on any
# failure, so an unsanitized restore can never be served through nginx.
set -euo pipefail

cd /opt/basa-sandbox
test -s .env.sandbox
test -f scripts/sanitize-sandbox.sql

compose() {
  docker compose --env-file .env.sandbox -f docker-compose.sandbox.yml "$@"
}

# New tables or columns may contain PII. Require a sanitizer review whenever
# the production schema changes before any raw data is copied.
schema_hash() {
  docker exec -i "$1" sh -c 'exec psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At' <<'SQL'
SELECT md5(string_agg(table_name || '.' || column_name || ':' || data_type || ':' || is_nullable, ',' ORDER BY table_name, ordinal_position))
FROM information_schema.columns
WHERE table_schema = 'public';
SQL
}

expected_schema_hash=547f8abfb160ec72494ecfce19f8b9cc
actual_schema_hash="$(schema_hash basa-postgres-prod)"
if [ "$actual_schema_hash" != "$expected_schema_hash" ]; then
  echo 'Production schema changed; review and update the sanitizer before refreshing.'
  exit 1
fi

echo 'Stopping the sandbox app before copying production data...'
compose stop basa-app
rm -f .sandbox-sanitized
compose up -d postgres

echo 'Streaming a consistent production snapshot to the sandbox database...'
docker exec basa-postgres-prod sh -c \
  'exec pg_dump -Fc --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' |
  docker exec -i basa-postgres-sandbox sh -c \
  'exec pg_restore --single-transaction --clean --if-exists --no-owner --no-acl --exit-on-error -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

actual_schema_hash="$(schema_hash basa-postgres-sandbox)"
if [ "$actual_schema_hash" != "$expected_schema_hash" ]; then
  echo 'Restored schema does not match the sanitizer; sandbox remains stopped.'
  exit 1
fi

echo 'Removing private records and replacing identifying content...'
docker exec -i basa-postgres-sandbox sh -c \
  'exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < scripts/sanitize-sandbox.sql >/dev/null

echo 'Creating the independent review admin...'
compose --profile tools run --rm seed >/dev/null

printf '%s\n' "$expected_schema_hash" > .sandbox-sanitized
chmod 600 .sandbox-sanitized

echo 'Starting the sanitized sandbox...'
compose up -d --no-deps --force-recreate basa-app
for i in $(seq 1 24); do
  if curl -fsS -o /dev/null http://127.0.0.1:3002/api/health; then
    echo 'Sanitized sandbox is healthy.'
    exit 0
  fi
  sleep 5
done
echo 'Sandbox failed its health check; inspect basa-app-sandbox.'
docker logs --tail 60 basa-app-sandbox 2>&1 || true
exit 1
