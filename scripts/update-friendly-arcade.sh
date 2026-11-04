#!/usr/bin/env bash
# Copy of the Friendly Arcade layers for sites without a build step.
# Put this script in the consuming repo as scripts/update-friendly-arcade.sh and run:
#   scripts/update-friendly-arcade.sh            # latest release
#   scripts/update-friendly-arcade.sh v2.1.0     # a specific tag
# It writes vendor/friendly-arcade/{tokens,base,components}.css and VERSION. Never edit those files by hand.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=Figarist/friendly-arcade
DIR=vendor/friendly-arcade
TAG="${1:-$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p')}"
[ -n "$TAG" ] || { echo "Could not find the latest release of $REPO" >&2; exit 1; }
mkdir -p "$DIR"
for f in tokens.css base.css components.css; do
  curl -fsSL "https://raw.githubusercontent.com/$REPO/$TAG/$f" -o "$DIR/$f"
done
echo "$TAG" > "$DIR/VERSION"
echo "friendly-arcade $TAG -> $DIR (remember to bump your service worker cache if you have one)"
