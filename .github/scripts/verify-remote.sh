#!/bin/bash
# Runs on the production server via: ssh user@host 'bash -s' < this-file
#
# This is the post-deploy check from the outside: through nginx and TLS on the
# real hostname, not the localhost port the deploy script already probed. It
# catches the cases the in-container check cannot see - expired certificate,
# nginx pointing at the wrong upstream, Varnish serving a stale error.
set -euo pipefail

PUBLIC_URL=https://app.businessassociationsa.com

docker compose --env-file /opt/basa-app/.env.production \
  -f /opt/basa-app/docker-compose.prod.yml ps

# The old version ended in `|| echo "Health check endpoint not responding"`,
# which turned a dead site into a success line in the deploy log.
echo "Checking $PUBLIC_URL/api/health ..."
if ! curl -fsS --max-time 15 "$PUBLIC_URL/api/health"; then
  echo ""
  echo "ERROR: the public health endpoint did not respond successfully."
  exit 1
fi

echo ""
echo "Public health check passed."
