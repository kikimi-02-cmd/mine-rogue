#!/usr/bin/env bash
# 次回用: 英語の画面に日本語が残っていないかを数える（ビルド → 起動 → ブラウザで英語の画面を回る）。
# 使い方: bash scripts/check-en.sh        → 最後に JAPANESE_CHARS_ON_ENGLISH_SCREENS=0 なら合格
#        bash scripts/check-en.sh --dist → 配信版（npm run dist の out/）を回る（英語が既定か）
set -euo pipefail
cd "$(dirname "$0")/.."
export NODE_PATH="$(npm root -g)"
if [ "${1:-}" = "--dist" ]; then
  [ -f out/index.html ] || npm run dist >/dev/null
  python3 -m http.server 3101 -d out >/dev/null 2>&1 &
  PID=$!
  trap 'kill $PID 2>/dev/null || true' EXIT
  until curl -s -o /dev/null http://localhost:3101; do sleep 1; done
  DIST=1 node scripts/check-en.mjs http://localhost:3101
else
  npm run build >/dev/null
  npx next start -p 3100 >/dev/null 2>&1 &
  PID=$!
  trap 'kill $PID 2>/dev/null || true' EXIT
  until curl -s -o /dev/null http://localhost:3100; do sleep 1; done
  node scripts/check-en.mjs http://localhost:3100
fi
