#!/usr/bin/env bash
#
# Push imported WordPress media up to the production uploads volume.
#
#   ./scripts/push-media.sh ./media            # copy ./media to the host
#   ./scripts/push-media.sh ./media --dry-run  # show what would be sent
#   MEDIA_HOST=root@example ./scripts/push-media.sh ./media
#
# The events importer (`pnpm migrate:events --images ./media`) fetches every event
# and venue image out of WordPress and rewrites the database to point at local
# `/uploads/...` paths. Those paths only resolve once the files are actually on the
# host, in the directory bind-mounted at `public/uploads` by docker-compose.prod.yml.
#
# This is deliberately separate from the importer: the importer runs against a
# database, this touches a server. Run the importer first, this second.
#
# Safe to re-run - rsync skips files that are already there and identical. It never
# deletes: a file on the host that is not in the local directory is left alone,
# because the host is the live copy and this is not an authority on what belongs.
set -euo pipefail

HOST="${MEDIA_HOST:-root@31.97.214.26}"
REMOTE_DIR="${MEDIA_REMOTE_DIR:-/opt/basa-app/uploads}"
SRC="${1:-}"
shift || true
DRY=""

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY="--dry-run" ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ -z "$SRC" ]; then
  echo "usage: $0 <media-dir> [--dry-run]" >&2
  exit 2
fi
if [ ! -d "$SRC" ]; then
  echo "no such directory: $SRC" >&2
  exit 1
fi
if [ ! -f "$SRC/manifest.json" ]; then
  echo "warning: $SRC has no manifest.json - is this the directory passed to --images?" >&2
fi

COUNT=$(find "$SRC" -type f ! -name manifest.json | wc -l | tr -d ' ')
SIZE=$(du -sh "$SRC" | cut -f1)

echo "Source:      $SRC ($COUNT files, $SIZE)"
echo "Destination: $HOST:$REMOTE_DIR"
[ -n "$DRY" ] && echo "Mode:        dry run, nothing will be written"
echo

# The bind mount's directory has to exist before the container can read from it.
# Docker would create it as root anyway on the next `up`; making it here means the
# rsync below does not fail against a missing path on a first run.
ssh "$HOST" "mkdir -p '$REMOTE_DIR'"

# --no-perms/-owner/-group: files arrive owned by root with default permissions,
# which the container's non-root user can still read. Preserving a macOS uid here
# would only create confusion on the host.
rsync -rtv --no-perms --no-owner --no-group $DRY \
  --exclude manifest.json \
  "$SRC/" "$HOST:$REMOTE_DIR/"

if [ -n "$DRY" ]; then
  echo
  echo "Dry run only. Re-run without --dry-run to copy."
  exit 0
fi

echo
REMOTE_COUNT=$(ssh "$HOST" "find '$REMOTE_DIR' -type f | wc -l | tr -d ' '")
echo "$REMOTE_COUNT files now on the host."
echo
echo "Verify a file is actually served, e.g.:"
echo "  curl -sS -o /dev/null -w '%{http_code}\\n' https://app.businessassociationsa.com/uploads/<filename>"
