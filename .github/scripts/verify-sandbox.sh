#!/usr/bin/env bash
set -euo pipefail

docker compose --env-file /opt/basa-sandbox/.env.sandbox \
  -f /opt/basa-sandbox/docker-compose.sandbox.yml ps

curl -fsS --max-time 15 http://127.0.0.1:3002/api/health >/dev/null

# The public endpoint must have valid TLS and require review credentials.
status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
  https://dev.businessassociationsa.com/api/health)"
if [ "$status" != 401 ]; then
  echo "Expected HTTP 401 from the password gate; got $status"
  exit 1
fi
echo 'Sandbox health, TLS, and password gate passed.'
