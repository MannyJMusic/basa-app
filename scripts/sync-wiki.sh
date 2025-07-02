#!/bin/bash
# sync-wiki.sh
# Syncs the local wiki/ directory to the GitHub wiki repository

set -e

# Configuration
WIKI_REPO="../basa-app.wiki"
LOCAL_WIKI_DIR="$(dirname "$0")/../wiki"

# Check if wiki repo exists
if [ ! -d "$WIKI_REPO" ]; then
  echo "Wiki repository not found at $WIKI_REPO."
  echo "Please clone your wiki repo first:"
  echo "  git clone https://github.com/MannyJMusic/basa-app.wiki.git $WIKI_REPO"
  exit 1
fi

# Copy all .md files from local wiki to wiki repo
cp "$LOCAL_WIKI_DIR"/*.md "$WIKI_REPO"/

cd "$WIKI_REPO"

git add .

if git diff --cached --quiet; then
  echo "No changes to commit. Wiki is up to date."
else
  git commit -m "Sync wiki from main repo"
  git push origin main
  echo "Wiki updated and pushed to GitHub."
fi 