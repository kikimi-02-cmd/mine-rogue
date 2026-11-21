#!/usr/bin/env bash
# 次回用: 写しを pr-shots ブランチ（main とは別の孤立ブランチ）の <名前>/ に置き、PR に貼る Markdown を出す。
# 使い方: bash scripts/push-shots.sh <写しのフォルダ> <名前>
set -euo pipefail
SRC="$(cd "$1" && pwd)"; NAME="$2"
REPO_URL="https://github.com/kikimi-02-cmd/mine-rogue"
WT="$(mktemp -d)"
git fetch -q origin pr-shots 2>/dev/null && git worktree add -q "$WT" origin/pr-shots --detach \
  || { git worktree add -q --detach "$WT" && (cd "$WT" && git checkout -q --orphan tmp && git rm -rqf . ); }
mkdir -p "$WT/$NAME" && cp "$SRC"/*.png "$WT/$NAME/"
(cd "$WT" && git add "$NAME" && git commit -qm "shots: $NAME" && git push -q origin HEAD:refs/heads/pr-shots)
git worktree remove --force "$WT"
for f in "$SRC"/*.png; do b="$(basename "$f")"; echo "![${b%.png}](${REPO_URL}/blob/pr-shots/${NAME}/${b}?raw=true)"; done
