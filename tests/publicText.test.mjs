// 公開物（画面の文字・共有の文・タグ・結果のカード・画像の説明）に、他の SNS やサービスの名前が入っていないかを
// ソースの検査で止める。ここが落ちたら、その文字を直す（見張りの一覧を緩めない）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { containsBannedService } from "../src/lib/shareGuard.ts";

const ROOTS = ["app", "src", "public/manifest.json"];
// 見張りの一覧そのもの
const SKIP_FILES = new Set(["src/lib/shareGuard.ts"]);
const EXT = /\.(tsx?|json|txt|md)$/;

function walk(p, out = []) {
  if (statSync(p).isDirectory()) {
    for (const f of readdirSync(p)) walk(join(p, f), out);
  } else if (EXT.test(p)) out.push(p);
  return out;
}

// コードの中で、画面にも共有の文にも出ない書き方だけを外す
function publicPart(src) {
  return src
    .split("\n")
    // Next.js の metadata の欄の名前（<meta name="twitter:card"> の欄。表示される文字ではない）
    .filter((l) => !/^\s*twitter:\s*\{\s*$/.test(l))
    // eslint の指示のコメント（eslint-disable-next-line の "line"）
    .map((l) => l.replace(/eslint-disable(-next-line|-line)?/g, ""))
    .join("\n");
}

test("公開物のソースに、他の SNS・サービスの名前が無い", () => {
  const hits = [];
  for (const root of ROOTS) {
    for (const f of walk(root)) {
      if (SKIP_FILES.has(f)) continue;
      const text = publicPart(readFileSync(f, "utf8"));
      text.split("\n").forEach((line, i) => {
        if (containsBannedService(line)) hits.push(`${f}:${i + 1}: ${line.trim()}`);
      });
    }
  }
  assert.deepEqual(hits, []);
});

test("ハッシュタグはゲーム名の 1 つだけ", () => {
  const share = readFileSync("src/lib/share.ts", "utf8");
  // 色の指定（#0F2340 など）は除く
  const tags = [...share.matchAll(/["'`](#[^\s"'`]+)["'`]/g)]
    .map((m) => m[1])
    .filter((t) => !/^#[0-9A-Fa-f]{3,8}$/.test(t));
  assert.deepEqual([...new Set(tags)], ["#MineRogue"]);
});
