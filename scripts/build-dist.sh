#!/usr/bin/env bash
# 次回用: 配信版の zip を作る（提出はしない。Owner の手）。
#   - NEXT_PUBLIC_DIST=1 で静的に書き出し（外部へのリンク・広告・計測なし、キーでページが動かない）
#   - どの階層に置かれても動くよう、/_next/ などの絶対パスを相対に直す
#   - index.html が zip の一番上。20MB 未満を確かめる
# 使い方: bash scripts/build-dist.sh   → dist/mine-rogue-web.zip
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf out dist
NEXT_PUBLIC_DIST=1 npx next build
node scripts/relativize-dist.mjs out
# 配信版に要らないもの（サイト用の SEO ファイル）
rm -f out/robots.txt out/sitemap.xml out/google*.html out/ads.txt out/{next,vercel,file,globe,window}.svg
rm -rf out/cache out/types out/server 2>/dev/null || true
mkdir -p dist
(cd out && zip -qr ../dist/mine-rogue-web.zip .)
SIZE=$(stat -c %s dist/mine-rogue-web.zip)
unzip -l dist/mine-rogue-web.zip | grep -q " index.html$" || { echo "index.html が一番上にありません"; exit 1; }
if [ "$SIZE" -ge $((20 * 1024 * 1024)) ]; then echo "20MB 以上です: $SIZE"; exit 1; fi
PAT="(src|href)=[\"']?https?://|googlesyndication|googletagmanager"
if grep -rqE "$PAT" out --include=*.html; then echo "外部の読み込み・リンクが残っています"; grep -roE ".{40}($PAT).{40}" out --include=*.html | head; exit 1; fi
echo "OK dist/mine-rogue-web.zip ($((SIZE / 1024)) KB)"
