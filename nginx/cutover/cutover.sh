#!/usr/bin/env bash
#
# WordPress -> basa-app cutover for businessassociationsa.com (#71).
# Runs on the production host as root. Everything it changes is reversible with
# rollback.sh in the same directory, and every step prints what it did.
#
#   /root/cutover-2026-09-18/cutover.sh            # do it
#   /root/cutover-2026-09-18/cutover.sh --check    # only run the post-cutover checks
#
# Before running: the final import has been done from the last dump, and
# basa-redirects.conf in this directory is regenerated from that same dump.
set -euo pipefail

D="$(cd "$(dirname "$0")" && pwd)"
SITES=/etc/nginx/sites-enabled
WP_VHOST="$SITES/srv1152916.hstgr.cloud.conf"
WP_ROOT=/home/user/htdocs/srv1152916.hstgr.cloud
WP_INTERNAL=https://srv1152916.hstgr.cloud
APP=https://app.businessassociationsa.com
NAMES="businessassociationsa.com www.businessassociationsa.com member.businessassociationsa.com"

wp() { sudo -u user -- wp --path="$WP_ROOT" --skip-plugins --skip-themes "$@"; }

check() {
  local fail=0
  echo; echo "== Checks =="
  for host in $NAMES; do
    code=$(curl -sS -o /dev/null -w '%{http_code}' --resolve "$host:443:127.0.0.1" "https://$host/")
    loc=$(curl -sS -o /dev/null -w '%{redirect_url}' --resolve "$host:443:127.0.0.1" "https://$host/")
    printf '%-38s %s -> %s\n' "https://$host/" "$code" "$loc"
    [ "$code" = 301 ] && [ "$loc" = "$APP/" ] || fail=1
  done
  # one of each disposition from docs/REDIRECTS.md
  for pair in "/events/basa-annual-banquet/|301|$APP/events/basa-annual-banquet" "/login/|301|$APP/auth/sign-in" "/assertion-page/|410|" "/some/unmapped/path?x=1|301|$APP/some/unmapped/path?x=1"; do
    IFS='|' read -r path want wantloc <<<"$pair"
    code=$(curl -sS -o /dev/null -w '%{http_code}' --resolve "businessassociationsa.com:443:127.0.0.1" "https://businessassociationsa.com$path")
    loc=$(curl -sS -o /dev/null -w '%{redirect_url}' --resolve "businessassociationsa.com:443:127.0.0.1" "https://businessassociationsa.com$path")
    printf '%-38s %s -> %s\n' "$path" "$code" "$loc"
    [ "$code" = "$want" ] && [ "$loc" = "$wantloc" ] || fail=1
  done
  code=$(curl -sS -o /dev/null -w '%{http_code}' -k --resolve "srv1152916.hstgr.cloud:443:127.0.0.1" "$WP_INTERNAL/")
  printf '%-38s %s (WordPress, internal name only)\n' "$WP_INTERNAL/" "$code"
  [ "$code" = 200 ] || fail=1
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$APP/api/health")
  printf '%-38s %s\n' "$APP/api/health" "$code"
  [ "$code" = 200 ] || fail=1
  echo
  if [ $fail = 0 ]; then echo "All checks passed."; else echo "SOME CHECKS FAILED - read the lines above; rollback.sh restores the previous state." >&2; return 1; fi
}

if [ "${1:-}" = "--check" ]; then check; exit $?; fi

echo "== 1. Preserve what is about to change =="
cp -a "$WP_VHOST" "$D/srv1152916.hstgr.cloud.conf.pre-cutover"
wp option get home    > "$D/wp-home.pre-cutover"
wp option get siteurl > "$D/wp-siteurl.pre-cutover"
wp option get blog_public > "$D/wp-blog_public.pre-cutover"
echo "saved vhost and WordPress home/siteurl/blog_public to $D"

echo "== 2. Take the public names off the WordPress vhost =="
sed -i 's/ businessassociationsa\.com www\.businessassociationsa\.com member\.businessassociationsa\.com;/;/g' "$WP_VHOST"
if grep -q "businessassociationsa.com" "$WP_VHOST"; then
  echo "the WordPress vhost still mentions businessassociationsa.com - stopping before anything is enabled" >&2; exit 1
fi
echo "WordPress now answers only on srv1152916.hstgr.cloud"

echo "== 3. Install the redirect rules and the apex vhost =="
install -m 644 "$D/basa-redirects.conf" /etc/nginx/basa-redirects.conf
install -m 644 "$D/businessassociationsa.com.conf" "$SITES/businessassociationsa.com.conf"
nginx -t
systemctl reload nginx
echo "nginx reloaded"

echo "== 4. Point WordPress at its internal name and hide it from search =="
# Without this WordPress redirects every visitor to its `home`, i.e. straight
# back to the apex and on to basa-app - the fallback copy would be unreachable.
wp option update home    "$WP_INTERNAL"
wp option update siteurl "$WP_INTERNAL"
wp option update blog_public 0
wp cache flush >/dev/null 2>&1 || true
echo "WordPress home/siteurl = $WP_INTERNAL, blog_public = 0 (noindex)"

echo "== 5. Certificate renewal: nothing to do =="
# The apex vhost serves ACME challenges from the WordPress htdocs, which is the
# webroot certbot already has on record for the \`basa\` certificate, so renewal of
# all four names keeps working unchanged. Prove it without touching anything:
certbot renew --cert-name basa --dry-run --no-random-sleep-on-renew >/dev/null 2>&1 && echo "certbot dry-run renewal OK" \
  || echo "WARNING: certbot dry-run renewal failed; investigate before 2026-12-07 (certbot renew --cert-name basa --dry-run --no-random-sleep-on-renew)" >&2

check
