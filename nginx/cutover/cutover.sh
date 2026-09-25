#!/usr/bin/env bash
#
# WordPress -> basa-app cutover for businessassociationsa.com (#71).
# After this, the apex IS basa-app; app.businessassociationsa.com redirects to it.
#
# Runs on the production host as root. Every step prints what it did, everything
# it changes is saved first, and rollback.sh in the same directory undoes it.
#
#   /root/cutover/cutover.sh            # do it (about 25 minutes; the rebuild is most of it)
#   /root/cutover/cutover.sh --check    # only run the post-cutover checks
#
# Before running: the final import has been done from the last dump, the rules in
# this directory were regenerated from that same dump with --same-host, and the
# Google OAuth client already lists https://businessassociationsa.com/api/auth/callback/google.
set -euo pipefail

D="$(cd "$(dirname "$0")" && pwd)"
APP_DIR=/opt/basa-app
ENV="$APP_DIR/.env.production"
SITES=/etc/nginx/sites-enabled
WP_VHOST="$SITES/srv1152916.hstgr.cloud.conf"
APP_VHOST="$SITES/app.businessassociationsa.com.conf"
WP_ROOT=/home/user/htdocs/srv1152916.hstgr.cloud
WP_INTERNAL=https://srv1152916.hstgr.cloud
APEX=https://businessassociationsa.com
APP_OLD=https://app.businessassociationsa.com
STRIPE_ENDPOINT=we_1UG1R3Kf87fwbbM1r6EG3Xqx
CRON=/etc/cron.d/basa
# Webhook events the app handles (src/lib/stripe-webhook-handlers.ts). The endpoint
# was created before member-rate holds existed and lacks amount_capturable_updated.
STRIPE_EVENTS=(payment_intent.succeeded payment_intent.payment_failed payment_intent.canceled payment_intent.amount_capturable_updated customer.subscription.created customer.subscription.updated customer.subscription.deleted invoice.payment_succeeded invoice.payment_failed)
stripe_key() { grep "^STRIPE_SECRET_KEY=" "$ENV" | cut -d= -f2- | tr -d '"'; }

wp() { sudo -u user -- wp --path="$WP_ROOT" --skip-plugins --skip-themes "$@"; }
c() { curl -sS -o /dev/null -w '%{http_code}' --resolve "${1#https://}:443:127.0.0.1" "$1$2"; }
loc() { curl -sS -o /dev/null -w '%{redirect_url}' --resolve "${1#https://}:443:127.0.0.1" "$1$2"; }

check() {
  local fail=0
  echo; echo "== Checks =="
  row() { printf '%-58s %s\n' "$1" "$2"; }

  # the apex is the app
  code=$(c $APEX /api/health); row "$APEX/api/health" "$code"; [ "$code" = 200 ] || fail=1
  code=$(c $APEX /events);     row "$APEX/events" "$code";     [ "$code" = 200 ] || fail=1
  body=$(curl -sS --resolve businessassociationsa.com:443:127.0.0.1 "$APEX/" | grep -c "Business Association" || true)
  row "$APEX/ mentions BASA" "$body"; [ "$body" -ge 1 ] || fail=1
  code=$(c $APEX /uploads/2026-Bowling-Sponsorships.png); row "$APEX/uploads/… image" "$code"; [ "$code" = 200 ] || fail=1
  sm=$(curl -sS --resolve businessassociationsa.com:443:127.0.0.1 "$APEX/sitemap.xml" | grep -c "<loc>https://businessassociationsa.com/" || true)
  row "$APEX/sitemap.xml apex URLs" "$sm"; [ "$sm" -ge 10 ] || fail=1

  # other names redirect to the apex
  for h in https://www.businessassociationsa.com https://member.businessassociationsa.com $APP_OLD; do
    code=$(c $h /events); l=$(loc $h /events); row "$h/events" "$code -> $l"
    [ "$code" = 301 ] && [ "$l" = "$APEX/events" ] || fail=1
  done
  code=$(c $APP_OLD /api/webhooks/stripe); row "$APP_OLD/api/webhooks/stripe (proxied, GET)" "$code"; [ "$code" != 301 ] || fail=1

  # one of each disposition from docs/REDIRECTS.md
  for pair in "/events/basa-annual-banquet/|301|$APEX/events/basa-annual-banquet" "/events/basa-annual-banquet|200|" "/login/|301|$APEX/auth/sign-in" "/product/cc-market-annual/|301|$APEX/membership/pricing" "/assertion-page/|410|" "/some/unmapped/path|404|"; do
    IFS='|' read -r path want wantloc <<<"$pair"
    code=$(c $APEX "$path"); l=$(loc $APEX "$path"); row "$path" "$code -> $l"
    [ "$code" = "$want" ] && [ "$l" = "$wantloc" ] || fail=1
  done

  code=$(curl -sS -o /dev/null -w '%{http_code}' -k --resolve "srv1152916.hstgr.cloud:443:127.0.0.1" "$WP_INTERNAL/")
  row "$WP_INTERNAL/ (WordPress, internal name)" "$code"; [ "$code" = 200 ] || fail=1

  # the hardening came along (CSP, rate-limited image optimizer guard)
  csp=$(curl -sSI --resolve businessassociationsa.com:443:127.0.0.1 "$APEX/" | grep -ci "^content-security-policy:" || true)
  row "$APEX/ has the enforced CSP" "$csp"; [ "$csp" = 1 ] || fail=1
  code=$(c $APEX "/_next/image?url=https://example.com/x.png&w=64&q=75"); row "$APEX/_next/image foreign url (guard)" "$code"; [ "$code" = 403 ] || fail=1

  # the host's cron jobs reach the app on the apex (401 = reached it, no token sent)
  code=$(curl -sS -o /dev/null -w '%{http_code}' -X POST --resolve businessassociationsa.com:443:127.0.0.1 "$APEX/api/cron/release-stale-holds")
  row "POST $APEX/api/cron/release-stale-holds (no token)" "$code"; [ "$code" = 401 ] || fail=1
  if grep -q "app\.businessassociationsa\.com" "$CRON"; then row "$CRON still calls app." "yes"; fail=1; else row "$CRON calls the apex" "yes"; fi

  # Stripe delivers member-rate authorizations to the app
  ev=$(curl -sS -u "$(stripe_key):" "https://api.stripe.com/v1/webhook_endpoints/$STRIPE_ENDPOINT" \
    | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("url"), "amount_capturable_updated" if "payment_intent.amount_capturable_updated" in d.get("enabled_events",[]) else "MISSING")')
  row "Stripe endpoint" "$ev"; [ "$ev" = "$APEX/api/webhooks/stripe amount_capturable_updated" ] || fail=1

  echo
  if [ $fail = 0 ]; then echo "All checks passed."; else echo "SOME CHECKS FAILED - read the lines above; rollback.sh restores the previous state." >&2; return 1; fi
}

if [ "${1:-}" = "--check" ]; then check; exit $?; fi

echo "== 1. Preserve what is about to change =="
cp -a "$WP_VHOST"  "$D/srv1152916.hstgr.cloud.conf.pre-cutover"
cp -a "$APP_VHOST" "$D/app.businessassociationsa.com.conf.pre-cutover"
cp -a "$ENV"       "$D/.env.production.pre-cutover"; chmod 600 "$D/.env.production.pre-cutover"
cp -a "$CRON"      "$D/cron.d-basa.pre-cutover"
curl -sS -u "$(stripe_key):" "https://api.stripe.com/v1/webhook_endpoints/$STRIPE_ENDPOINT" > "$D/stripe-endpoint.pre-cutover.json"; chmod 600 "$D/stripe-endpoint.pre-cutover.json"
wp option get home        > "$D/wp-home.pre-cutover"
wp option get siteurl     > "$D/wp-siteurl.pre-cutover"
wp option get blog_public > "$D/wp-blog_public.pre-cutover"
echo "saved both vhosts, .env.production, the cron file, the Stripe endpoint and WordPress home/siteurl/blog_public to $D"

echo "== 2. Take the public names off the WordPress vhost =="
sed -i 's/ businessassociationsa\.com www\.businessassociationsa\.com member\.businessassociationsa\.com;/;/g' "$WP_VHOST"
if grep -q "businessassociationsa.com" "$WP_VHOST"; then
  echo "the WordPress vhost still mentions businessassociationsa.com - stopping before anything is enabled" >&2; exit 1
fi

echo "== 3. Apex vhost serves the app; app. keeps working for now =="
install -m 644 "$D/basa-redirects.conf" /etc/nginx/basa-redirects.conf
install -m 644 "$D/businessassociationsa.com.conf" "$SITES/businessassociationsa.com.conf"
nginx -t && systemctl reload nginx
sleep 2
echo "nginx reloaded: $APEX now proxies to basa-app (health $(c $APEX /api/health))"

echo "== 4. The app's own idea of its URL =="
sed -i -E "s#^(NEXTAUTH_URL=).*#\1\"$APEX\"#; s#^(NEXT_PUBLIC_APP_URL=).*#\1\"$APEX\"#" "$ENV"
grep -E "^(NEXTAUTH_URL|NEXT_PUBLIC_APP_URL)=" "$ENV"

echo "== 5. Rebuild and redeploy (NEXT_PUBLIC_APP_URL is baked into the client bundle) =="
# The ordinary deploy script: git reset to origin/main, build, up, health check,
# rollback to the previous image if unhealthy. Takes ~20 minutes on this host.
# Build args (NEXT_PUBLIC_APP_URL among them) come from .env.production via compose.
( cd "$APP_DIR" && bash .github/scripts/deploy-remote.sh )

echo "== 6. app. becomes a redirect =="
install -m 644 "$D/app.businessassociationsa.com.conf" "$APP_VHOST"
nginx -t && systemctl reload nginx

echo "== 7. Stripe webhook endpoint: apex URL and the full event list =="
# The endpoint already points at the apex (it was set up ahead of the cutover); this
# makes that explicit and adds payment_intent.amount_capturable_updated, without
# which member-rate holds are only confirmed by the 15-minute stale-hold sweep.
args=(-d url="$APEX/api/webhooks/stripe")
for e in "${STRIPE_EVENTS[@]}"; do args+=(-d "enabled_events[]=$e"); done
curl -sS -u "$(stripe_key):" -X POST "https://api.stripe.com/v1/webhook_endpoints/$STRIPE_ENDPOINT" "${args[@]}" \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); print("stripe endpoint", d.get("id"), d.get("status"), d.get("url"), len(d.get("enabled_events",[])), "events", d.get("error",{}).get("message",""))'

echo "== 7b. The host's cron jobs call the apex =="
# app. becomes a 301, and curl -X POST does not follow it: without this, stale-hold
# release, member-rate expiry and membership expiry would silently stop.
sed -i 's#https://app\.businessassociationsa\.com/#https://businessassociationsa.com/#g' "$CRON"
grep -c "businessassociationsa.com/api/cron" "$CRON" | xargs -I{} echo "{} cron entries now call the apex"

echo "== 8. WordPress: internal name only, hidden from search =="
# Without this WordPress redirects every visitor to its `home`, i.e. straight to
# the apex and into basa-app - the fallback copy would be unreachable.
wp option update home    "$WP_INTERNAL"
wp option update siteurl "$WP_INTERNAL"
wp option update blog_public 0
wp cache flush >/dev/null 2>&1 || true

echo "== 9. Certificate renewal still works (dry run, changes nothing) =="
certbot renew --cert-name basa --dry-run --no-random-sleep-on-renew >/dev/null 2>&1 && echo "basa: dry-run renewal OK" \
  || echo "WARNING: basa dry-run renewal failed; investigate before 2026-12-07" >&2
certbot renew --cert-name basa-app --dry-run --no-random-sleep-on-renew >/dev/null 2>&1 && echo "basa-app: dry-run renewal OK" \
  || echo "WARNING: basa-app dry-run renewal failed; investigate before 2026-12-07" >&2

check
