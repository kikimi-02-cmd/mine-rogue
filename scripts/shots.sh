#!/usr/bin/env bash
# 次回用: ビルド → 起動 → 390×844 / 960×540 の写しを撮る。使い方: bash scripts/shots.sh <出力フォルダ> [scene...]
set -euo pipefail
OUT="${1:-shots}"; shift || true
npm run build >/dev/null
npx next start -p 3100 >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
until curl -s -o /dev/null http://localhost:3100; do sleep 1; done
NODE_PATH="$(npm root -g)" node scripts/shots.mjs "$OUT" "$@"
