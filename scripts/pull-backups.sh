#!/usr/bin/env bash
#
# Pull the production database dumps down to this machine.
#
#   ./scripts/pull-backups.sh              # newest dumps into ./backups/
#   ./scripts/pull-backups.sh --all        # every dump the host still retains
#   BACKUP_DEST=~/somewhere ./scripts/pull-backups.sh
#
# The off-box copy of record is Hostinger's own VPS snapshots. This script is the
# second copy: it puts the nightly SQL dumps somewhere that is not the VPS, so a
# lost box does not take the only usable dumps with it.
#
# ./backups/ is gitignored, and so are *.sql.gz / *.dump anywhere in the tree.
# These files contain member PII, WordPress password hashes and payment records.
# Never commit them, never attach them to an issue, never paste their contents.
set -euo pipefail

HOST="${BACKUP_HOST:-root@31.97.214.26}"
REMOTE_DIR="${BACKUP_REMOTE_DIR:-/var/backups/basa}"
DEST="${BACKUP_DEST:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups}"
MODE="${1:-newest}"

mkdir -p "$DEST/mysql" "$DEST/postgres"

echo "Host:        $HOST"
echo "Destination: $DEST"
echo

fetch() {
  local subdir="$1"
  local remote_glob

  if [ "$MODE" = "--all" ]; then
    echo "== $subdir (all retained) =="
    # -r without --delete: the host prunes on a 14-day retention, and a local
    # copy that has aged out there is exactly the copy worth keeping.
    rsync -rtv --no-perms --no-owner --no-group \
      "$HOST:$REMOTE_DIR/$subdir/" "$DEST/$subdir/"
    return
  fi

  echo "== $subdir (newest) =="
  # Resolve the newest file remotely rather than globbing locally, so this works
  # regardless of how many dumps the host is holding.
  remote_glob="$(ssh -o BatchMode=yes "$HOST" \
    "ls -1t $REMOTE_DIR/$subdir/*.sql.gz 2>/dev/null | head -1" || true)"

  if [ -z "$remote_glob" ]; then
    echo "  no dumps found in $REMOTE_DIR/$subdir"
    return
  fi

  echo "  newest: $(basename "$remote_glob")"
  rsync -tv --no-perms --no-owner --no-group \
    "$HOST:$remote_glob" "$DEST/$subdir/"
}

# Not piped into anything: piping rsync into tail and then reading $? gives you
# tail's exit status, which is how a silent no-op once got reported as success.
fetch mysql
fetch postgres

echo
echo "== verifying archives =="
bad=0
found=0
while IFS= read -r f; do
  found=$((found + 1))
  if gzip -t "$f" 2>/dev/null; then
    printf '  OK    %8s  %s\n' "$(du -h "$f" | cut -f1)" "${f#"$DEST"/}"
  else
    printf '  BAD           %s\n' "${f#"$DEST"/}"
    bad=$((bad + 1))
  fi
done < <(find "$DEST" -name '*.sql.gz' -type f | sort)

echo
if [ "$found" -eq 0 ]; then
  echo "ERROR: nothing was pulled."
  exit 1
fi
if [ "$bad" -ne 0 ]; then
  echo "ERROR: $bad archive(s) failed the gzip integrity check."
  exit 1
fi

echo "$found archive(s) present and intact in $DEST"
echo
echo "Reminder: these are gitignored on purpose. Do not commit or share them."
