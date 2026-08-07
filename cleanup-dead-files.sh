#!/usr/bin/env bash
# NihongoZen — Dead File Cleanup
# ---------------------------------------------------------------
# Every file below was checked with a project-wide grep and is not
# referenced by any .html or .js file in the repo. They are either
# early duplicates of files that were later rebuilt with different
# (and in some cases mismatched/stale) Firebase config, or stale
# PWA assets that were superseded by the ones in manifest.json /
# js/service-worker.js. Removing them changes zero runtime
# behavior — nothing on any page currently loads them.
#
# Run this from the project root:
#   bash cleanup-dead-files.sh
#
# It uses `git rm` if the folder is a git repo (so the deletion is
# staged and reviewable/revertable via git history), and falls back
# to a plain `rm` otherwise.
# ---------------------------------------------------------------
set -e

FILES=(
  "js/app.js"               # unreferenced; no page loads it
  "js/config.js"             # duplicate Firebase config, MISMATCHED appId vs config/config.js — the one actually in use
  "js/firebase-config.js"    # duplicate Firebase config, also contains the live Gemini API key a second time
  "js/auth-guard.js"         # duplicate auth-guard logic; index.html/login.html don't load this file
  "js/protect.js"            # imports "./firebase.js" which doesn't exist in this project — already broken
  "js/progress.js"           # unreferenced; no page loads it
  "js/manifest.js"           # unreferenced; no page loads it
  "assets/pwa/manifest.json" # stale duplicate — the LIVE manifest is the one at project root
  "assets/pwa/service-worker.js" # stale duplicate — tries to cache a non-existent dashboard.html; the LIVE service worker is js/service-worker.js
)

echo "The following ${#FILES[@]} unreferenced files will be removed (~40KB total):"
printf '  - %s\n' "${FILES[@]}"
echo
read -p "Proceed? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted — no files were touched."
  exit 0
fi

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
      git rm -q "$f"
    else
      rm "$f"
    fi
    echo "removed: $f"
  else
    echo "skip (not found): $f"
  fi
done

echo
echo "Done. If this is a git repo, review with 'git status' and commit when ready:"
echo "  git commit -m 'Remove unreferenced/dead files (duplicate configs, stale PWA assets)'"
