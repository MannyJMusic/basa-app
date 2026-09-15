#!/usr/bin/env bash
# Undo cutover.sh: WordPress answers on the public names again, basa-app stays on app.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
SITES=/etc/nginx/sites-enabled
WP_ROOT=/home/user/htdocs/srv1152916.hstgr.cloud
wp() { sudo -u user -- wp --path="$WP_ROOT" --skip-plugins --skip-themes "$@"; }

[ -f "$D/srv1152916.hstgr.cloud.conf.pre-cutover" ] || { echo "no pre-cutover vhost saved in $D; nothing to roll back" >&2; exit 1; }
rm -f "$SITES/businessassociationsa.com.conf" /etc/nginx/basa-redirects.conf
cp -a "$D/srv1152916.hstgr.cloud.conf.pre-cutover" "$SITES/srv1152916.hstgr.cloud.conf"
nginx -t
systemctl reload nginx
wp option update home        "$(cat "$D/wp-home.pre-cutover")"
wp option update siteurl     "$(cat "$D/wp-siteurl.pre-cutover")"
wp option update blog_public "$(cat "$D/wp-blog_public.pre-cutover")"
wp cache flush >/dev/null 2>&1 || true
echo "Rolled back: WordPress is public again on businessassociationsa.com."
curl -sS -o /dev/null -w 'https://businessassociationsa.com/ -> %{http_code}\n' --resolve businessassociationsa.com:443:127.0.0.1 https://businessassociationsa.com/
