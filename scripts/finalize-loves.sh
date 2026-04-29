#!/bin/bash
# Run from project root: bash scripts/finalize-loves.sh
# 1) Uploads loves images to R2
# 2) Patches local payload.db with media + linkages
# 3) Commits payload.db
# 4) Pushes to GitHub (you'll be prompted for credentials if not cached)
set -e

cd "$(dirname "$0")/.."
export PATH="$HOME/local/node/bin:$PATH"

echo "==> 1/3  uploading images to R2 + patching DB"
npm run seed:loves

echo ""
echo "==> 2/3  staging + committing payload.db"
git add payload.db scripts/seed-loves-images.ts package.json package-lock.json scripts/finalize-loves.sh 2>/dev/null || true
if git diff --staged --quiet; then
  echo "no changes to commit"
else
  git commit -m "Seed loves gallery images"
fi

echo ""
echo "==> 3/3  pushing to GitHub"
echo "(if prompted for password, paste a fresh PAT from https://github.com/settings/tokens/new)"
git push

echo ""
echo "✅ done locally."
echo ""
echo "Last manual step:"
echo "  Go to Railway → industrious-heart → Settings → Volumes → delete the volume."
echo "  When the redeploy finishes, /data/payload.db is re-seeded with the new linkages"
echo "  and the public site shows all the loves images."
