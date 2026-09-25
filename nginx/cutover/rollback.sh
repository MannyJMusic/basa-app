#!/usr/bin/env bash
# Undo cutover.sh: WordPress answers on the public names again and basa-app is back
# on app.businessassociationsa.com. Takes a minute; no rebuild, because the deploy
# kept the pre-cutover image tagged basa-app:pre-cutover. That tag was pinned by hand
# right after the cutover: every deploy moves basa-app:rollback on, so after the first
# post-cutover deploy it no longer holds the image with app. compiled in.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
APP_DIR=/opt/basa-app
ENV="$APP_DIR/.env.production"
SITES=/etc/nginx/sites-enabled
WP_ROOT=/home/user/htdocs/srv1152916.hstgr.cloud
STRIPE_ENDPOINT=we_1UG1R3Kf87fwbbM1r6EG3Xqx
wp() { sudo -u user -- wp --path="$WP_ROOT" --skip-plugins --skip-themes "$@"; }

[ -f "$D/srv1152916.hstgr.cloud.conf.pre-cutover" ] || { echo "no pre-cutover files saved in $D; nothing to roll back" >&2; exit 1; }

echo "== nginx: WordPress public again, app. proxying again =="
rm -f "$SITES/businessassociationsa.com.conf" /etc/nginx/basa-redirects.conf
cp -a "$D/srv1152916.hstgr.cloud.conf.pre-cutover"     "$SITES/srv1152916.hstgr.cloud.conf"
cp -a "$D/app.businessassociationsa.com.conf.pre-cutover" "$SITES/app.businessassociationsa.com.conf"
nginx -t && systemctl reload nginx

echo "== app: previous env and previous image =="
cp -a "$D/.env.production.pre-cutover" "$ENV"; chmod 600 "$ENV"
cd "$APP_DIR"
if docker image inspect basa-app:pre-cutover >/dev/null 2>&1; then
  docker tag basa-app:pre-cutover basa-app:current
  echo "restored the pre-cutover image (app. baked into the client bundle)"
else
  echo "WARNING: no basa-app:pre-cutover image; the running build has the apex baked into its client bundle. Redeploy from main to rebuild." >&2
fi
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --no-deps basa-app
for i in $(seq 1 30); do [ "$(docker inspect -f '{{.State.Health.Status}}' basa-app-prod 2>/dev/null)" = healthy ] && break; sleep 3; done
echo "app container: $(docker inspect -f '{{.State.Health.Status}}' basa-app-prod)"

echo "== cron file =="
[ -f "$D/cron.d-basa.pre-cutover" ] && cp -a "$D/cron.d-basa.pre-cutover" /etc/cron.d/basa && echo "restored /etc/cron.d/basa"

echo "== Stripe webhook endpoint: the URL it had before =="
# Only the URL is restored; the added amount_capturable_updated event is harmless
# either way and is what the app wants.
if [ -f "$D/stripe-endpoint.pre-cutover.json" ]; then
  url=$(python3 -c 'import sys,json; print(json.load(open(sys.argv[1]))["url"])' "$D/stripe-endpoint.pre-cutover.json")
  K=$(grep "^STRIPE_SECRET_KEY=" "$ENV" | cut -d= -f2- | tr -d '"')
  curl -sS -u "$K:" -X POST "https://api.stripe.com/v1/webhook_endpoints/$STRIPE_ENDPOINT" -d url="$url" \
    | python3 -c 'import sys,json; d=json.load(sys.stdin); print("stripe endpoint", d.get("id"), d.get("url"), d.get("error",{}).get("message",""))'
  unset K
fi

echo "== WordPress options =="
wp option update home        "$(cat "$D/wp-home.pre-cutover")"
wp option update siteurl     "$(cat "$D/wp-siteurl.pre-cutover")"
wp option update blog_public "$(cat "$D/wp-blog_public.pre-cutover")"
wp cache flush >/dev/null 2>&1 || true

echo "Rolled back."
curl -sS -o /dev/null -w 'https://businessassociationsa.com/ -> %{http_code} (WordPress)\n' --resolve businessassociationsa.com:443:127.0.0.1 https://businessassociationsa.com/
curl -sS -o /dev/null -w 'https://app.businessassociationsa.com/api/health -> %{http_code} (basa-app)\n' --resolve app.businessassociationsa.com:443:127.0.0.1 https://app.businessassociationsa.com/api/health
