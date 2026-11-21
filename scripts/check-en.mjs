// 英語の画面に日本語が残っていないかを、ブラウザで実際に回って数える。
// 使い方: bash scripts/check-en.sh（ビルド→起動→この検査）
//   直接: NODE_PATH=$(npm root -g) node scripts/check-en.mjs [BASE_URL]   既定 http://localhost:3100
//   配信版: DIST=1 で、BASE_URL の index.html（英語が既定）だけを回る
// 見る所: 画面の文字・aria-label・title・alt・タブの題・説明・共有用の題と説明
// 回る画面: タイトル（ログインボーナス・招待・逃したお題・深層の解放つき）・図鑑・統計・遊び方・プライバシー・
//           遊び中（説明の吹き出し）・フロアクリア・スキル選び・スキルの説明・ゲームオーバー・深層・デイリー
// 日本語の文字が 1 つでもあれば、場所と文を出して終了コード 1。
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright"); // NODE_PATH=$(npm root -g) で全体の playwright を使う

const BASE = (process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const DIST = process.env.DIST === "1";
const JP = /[　-ヿ㐀-鿿＀-￯]/u;
const JP_RUN = /[　-ヿ㐀-鿿＀-￯][^\n]{0,30}/gu;

function localKey(d) {
  return d.toISOString().slice(0, 10);
}
const today = new Date();
const yesterday = localKey(new Date(today.getTime() - 86400000));
const threeDaysAgo = localKey(new Date(today.getTime() - 3 * 86400000));

// いろいろな表示が出るように、前に遊んだことのある端末の記録を入れておく（形は storage.ts と同じ）
const SEED = {
  mine_rogue_best_floor: "9",
  mine_rogue_deep_best: "6",
  mine_rogue_play_count: "12",
  mine_rogue_total_revealed: "300",
  mine_rogue_skill_counts: JSON.stringify({ shield: 3, xray: 2, amulet: 1, speed: 1 }),
  mine_rogue_streak: JSON.stringify({ lastDate: threeDaysAgo, count: 5, best: 5, freezes: 1, freezeWeek: null }),
  mine_rogue_lanterns: "1",
  mine_rogue_first_date: threeDaysAgo,
};

/**
 * いま見えている言葉を全部集める。
 * withMeta=false: / は日本語のページとして検索に載せる（英語は /en）ので、裏の説明（meta）は日本語のまま。画面とタブの題だけ見る
 */
async function collect(page, withMeta = true) {
  return page.evaluate((withMeta) => {
    const parts = [document.title, document.body.innerText];
    for (const el of document.querySelectorAll("[aria-label],[title],[alt],[placeholder]")) {
      for (const a of ["aria-label", "title", "alt", "placeholder"]) parts.push(el.getAttribute(a) ?? "");
    }
    if (withMeta) {
      for (const m of document.querySelectorAll(
        'meta[name="description"],meta[property^="og:"],meta[name^="twitter:"]',
      )) {
        parts.push(m.getAttribute("content") ?? "");
      }
    }
    return parts.join("\n");
  }, withMeta);
}

const findings = [];
const seen = new Set();
async function check(page, where, withMeta = !DIST) {
  const text = await collect(page, withMeta);
  let n = 0;
  for (const ch of text) if (JP.test(ch)) n++;
  seen.add(where);
  if (n > 0) {
    const samples = [...new Set(text.match(JP_RUN) ?? [])].slice(0, 8);
    findings.push({ where, n, samples });
  }
  return n;
}

const pause = (page, ms = 350) => page.waitForTimeout(ms);

async function newPage(browser, seed = SEED) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  await ctx.addInitScript((s) => {
    if (sessionStorage.getItem("__seeded")) return;
    sessionStorage.setItem("__seeded", "1");
    localStorage.clear();
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
  }, seed);
  return { ctx, page: await ctx.newPage() };
}

/** 盤を開け続けて、フロアクリア→スキル選び→…→ゲームオーバーまで。見た画面を検査する */
async function playThrough(page, label) {
  let sawSkill = false;
  for (let i = 0; i < 600; i++) {
    if (await page.locator("[data-again]").count()) {
      await check(page, `${label}: game over`);
      if (sawSkill) return true;
      // まだスキル選びを見ていなければ、もう一度
      await page.locator("[data-again]").click();
      await pause(page);
      continue;
    }
    if (await page.locator("[data-coach]").count()) await check(page, `${label}: tip`);
    if (await page.getByText("FLOOR CLEAR").count()) await check(page, `${label}: floor clear`);
    const pick = page.locator("[data-skill-choice]");
    if (await pick.count()) {
      await check(page, `${label}: skill select`);
      sawSkill = true;
      await pick.first().click();
      await pause(page);
      // スキルの説明（バーのアイコンを押す。発動のスキルは使ってしまうので、常時のものだけ見る）
      const bar = page.locator("button[title]");
      if (await bar.count()) await check(page, `${label}: skill bar`);
      continue;
    }
    const next = page.locator("main button").filter({ hasNotText: /⛏|🚩|🔦/ });
    const cells = page.locator("[data-cell='hidden']");
    const n = await cells.count();
    if (n === 0) {
      // フロアクリアの知らせ
      if (await next.count()) {
        await check(page, `${label}: floor clear`);
        await next.first().click();
      }
      await pause(page, 250);
      continue;
    }
    await cells.nth(Math.floor(Math.random() * n)).click({ force: true });
    await pause(page, 40);
  }
  return sawSkill;
}

const browser = await chromium.launch();
const root = DIST ? `${BASE}/index.html` : `${BASE}/en`;

{
  // タイトル（ログインボーナス・逃したお題・招待のリンク・深層の解放）
  const { ctx, page } = await newPage(browser);
  await page.goto(`${root}?d=${yesterday}`);
  await pause(page, 900);
  await check(page, "title (welcome, invite, missed dailies)");
  if (await page.locator("[data-welcome-close]").count()) await page.locator("[data-welcome-close]").click();
  await page.locator("[data-codex]").click();
  await pause(page);
  await check(page, "codex");
  await page.locator("button", { hasText: /Back to Title/ }).last().click();
  await pause(page);
  await page.locator("[data-stats]").click();
  await pause(page);
  await check(page, "stats");
  await page.locator("button", { hasText: /Back to Title/ }).last().click();
  await pause(page);
  await page.locator("[data-deep-start]").click();
  await pause(page);
  await check(page, "deep mode");
  await page.goto(root);
  await pause(page, 700);
  await page.locator("[data-daily-start]").click();
  await pause(page);
  await check(page, "daily");
  await ctx.close();
}

{
  // はじめての人: 説明の吹き出し → 遊び中 → スキル選び → ゲームオーバー
  const { ctx, page } = await newPage(browser, {});
  await page.goto(root);
  await pause(page, 900);
  await check(page, "title (first visit)");
  await page.locator("[data-start]").click();
  await pause(page);
  await check(page, "play (first tip)");
  const ok = await playThrough(page, "first run");
  if (!ok) findings.push({ where: "first run", n: 0, samples: ["(skill select was not reached; rerun)"] });
  await page.locator("[data-back-title]").click();
  await pause(page);
  await check(page, "title (after a run)");
  await ctx.close();
}

if (!DIST) {
  // 英語のブラウザで / を開いたとき・英語の遊び方とプライバシー
  for (const path of ["/", "/en/how-to-play", "/en/privacy"]) {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}${path}`);
    await pause(page, 900);
    await check(page, path, path !== "/");
    await ctx.close();
  }
}
await browser.close();

const total = findings.reduce((a, f) => a + f.n, 0);
for (const f of findings) {
  console.log(`✗ ${f.where}: ${f.n}`);
  for (const s of f.samples) console.log(`    ${s}`);
}
console.log(`checked ${seen.size} screens: ${[...seen].join(" / ")}`);
console.log(`JAPANESE_CHARS_ON_ENGLISH_SCREENS=${total}`);
process.exit(findings.length > 0 ? 1 : 0);
