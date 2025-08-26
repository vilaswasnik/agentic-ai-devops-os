#!/usr/bin/env bash
set -euo pipefail
note="${1:-manual}"
stamp=$(date -u +%Y%m%d-%H%M%S)
branch=$(git rev-parse --abbrev-ref HEAD)
# Stage files but exclude large files and directories
git add . || true
git reset *.tar.gz 2>/dev/null || true
git reset node_modules/ 2>/dev/null || true
git reset .git/ 2>/dev/null || true
# Create commit
if ! git diff --cached --quiet; then
  git commit -m "snapshot: $stamp $note" --no-verify
else
  echo "No changes to commit; tagging current HEAD." >&2
fi
# Tag
if git rev-parse -q --verify refs/tags/snap-$stamp >/dev/null 2>&1; then
  tag="snap-${stamp}-dup"
else
  tag="snap-$stamp"
fi
git tag -a "$tag" -m "manual snapshot $stamp $note"
echo "Created snapshot commit/tag on $branch: $tag"
