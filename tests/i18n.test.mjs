// 英語の画面に日本語が残らないかの検査（ソースと辞書）。
// 画面そのものの検査は scripts/check-en.sh（ブラウザで英語の画面を回って日本語の文字を数える）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ja } from "../src/i18n/ja.ts";
import { en } from "../src/i18n/en.ts";
import { resolveLang, browserPrefersJa, localePath, isCrawler } from "../src/i18n/lang.ts";
import { TITLES, UNLOCKS } from "../src/lib/progress.ts";
import { containsBannedService } from "../src/lib/shareGuard.ts";

const skillsData = JSON.parse(readFileSync("src/data/skills.json", "utf8"));

// ひらがな・カタカナ・漢字・全角の記号（「」・（）など）
const JP = /[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]/u;

/** 辞書の葉（文字列）を全部集める。関数はそれらしい引数で呼んで、出てきた文字列を見る */
function leaves(obj, path = "", out = []) {
  if (typeof obj === "string") out.push([path, obj]);
  else if (typeof obj === "function") {
    const args = Array.from({ length: obj.length }, (_, i) => (i % 2 === 0 ? 3 : "🔥"));
    out.push([`${path}()`, String(obj(...args))]);
    out.push([`${path}(1)`, String(obj(...args.map((a) => (typeof a === "number" ? 1 : a))))]);
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) leaves(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

function shape(obj) {
  if (typeof obj === "function") return `fn${obj.length}`;
  if (typeof obj === "string") return "s";
  if (Array.isArray(obj)) return obj.map(shape);
  if (obj && typeof obj === "object")
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, shape(obj[k])]));
  return typeof obj;
}

test("英語の辞書に日本語が 1 文字も無い", () => {
  const hits = leaves(en).filter(([, v]) => JP.test(v));
  assert.deepEqual(hits, []);
});

test("英語の辞書に他の SNS・サービスの名前が無い", () => {
  const hits = leaves(en).filter(([, v]) => containsBannedService(v));
  assert.deepEqual(hits, []);
});

test("日本語と英語の辞書は同じ形（キー・引数の数）", () => {
  assert.deepEqual(shape(en), shape(ja));
});

test("スキル・称号・解放の条件は全部に英語がある", () => {
  for (const s of skillsData) {
    assert.ok(en.skills[s.id]?.name, `skill name ${s.id}`);
    assert.ok(en.skills[s.id]?.description, `skill description ${s.id}`);
    // 日本語の辞書の名前と説明は skills.json と同じ（データと画面がずれない）
    assert.equal(ja.skills[s.id].name, s.name, s.id);
    assert.equal(ja.skills[s.id].description, s.description, s.id);
  }
  for (const t of TITLES) {
    assert.ok(en.titles[t.floor], `title ${t.floor}`);
    assert.equal(ja.titles[t.floor], t.name);
  }
  for (const u of UNLOCKS) {
    assert.ok(en.unlocks[u.skillId], `unlock ${u.skillId}`);
    assert.equal(ja.unlocks[u.skillId], u.label);
  }
});

test("スキルの英語の名前は短い（カードに 1 行で収まる）", () => {
  for (const [id, s] of Object.entries(en.skills)) {
    assert.ok(s.name.length <= 16, `${id}: ${s.name}`);
    assert.ok(s.description.length <= 64, `${id}: ${s.description}`);
  }
});

test("言葉の決め方: 手で選んだ > 配信版は英語 > /en は英語 > ロボットは / を日本語 > ブラウザが日本語なら日本語", () => {
  const base = { choice: null, isDist: false, route: "auto", languages: ["ja-JP"] };
  assert.equal(resolveLang(base), "ja");
  assert.equal(resolveLang({ ...base, languages: ["en-US", "ja"] }), "en");
  assert.equal(resolveLang({ ...base, languages: ["fr-FR"] }), "en");
  assert.equal(resolveLang({ ...base, languages: [] }), "en");
  assert.equal(resolveLang({ ...base, route: "en" }), "en");
  assert.equal(resolveLang({ ...base, isDist: true }), "en");
  assert.equal(resolveLang({ ...base, isDist: true, choice: "ja" }), "ja");
  assert.equal(resolveLang({ ...base, languages: ["fr"], choice: "ja" }), "ja");
  // 検索のロボットには / を日本語で（英語は /en で載る）
  assert.equal(resolveLang({ ...base, languages: ["en-US"], crawler: true }), "ja");
  assert.equal(resolveLang({ ...base, route: "en", crawler: true }), "en");
  assert.equal(isCrawler("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isCrawler("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604.1"), false);
  assert.equal(browserPrefersJa(["JA"]), true);
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(localePath("en", "/privacy"), "/en/privacy");
  assert.equal(localePath("ja", "/privacy"), "/privacy");
});

// ─── ソースの検査: 画面の部品に日本語の文字を直に書かない（辞書を通す） ──────

function walk(p, out = []) {
  if (statSync(p).isDirectory()) {
    for (const f of readdirSync(p)) walk(join(p, f), out);
  } else if (/\.(tsx?|json)$/.test(p)) out.push(p);
  return out;
}

/** コメントを除いた行 */
function codeLines(src) {
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return noBlock.split("\n").map((l) => l.replace(/(^|[^:"'`])\/\/.*$/, "$1"));
}

// 日本語を置いてよいファイル（日本語の辞書・日本語のページ・データの元・見張りの一覧）
const ALLOW = [
  /^src\/i18n\/ja\.ts$/,
  /^app\/\(ja\)\//,
  /^src\/data\/skills\.json$/,
  /^src\/lib\/shareGuard\.ts$/,
  // 称号・解放の条件の元のデータ（画面には辞書の言葉を出す）
  /^src\/lib\/progress\.ts$/,
  // 紹介するアプリは日本語だけなので、日本語の画面でしか出さない（CrossPromo の中で止める）
  /^src\/components\/CrossPromo\.tsx$/,
  // リンクの絵の説明（日本語の側）
  /^src\/lib\/seo\.ts$/,
];

test("画面の部品・英語のページのソースに日本語の文字が直に無い", () => {
  const hits = [];
  for (const root of ["app", "src"]) {
    for (const f of walk(root)) {
      const rel = f.split("\\").join("/");
      if (ALLOW.some((re) => re.test(rel))) continue;
      codeLines(readFileSync(f, "utf8")).forEach((line, i) => {
        if (JP.test(line)) hits.push(`${rel}:${i + 1}: ${line.trim()}`);
      });
    }
  }
  assert.deepEqual(hits, []);
});

test("紹介するアプリ（日本語だけ）は英語の画面では出さない", () => {
  const src = readFileSync("src/components/CrossPromo.tsx", "utf8");
  assert.match(src, /lang !== "ja"\) return null/);
});
