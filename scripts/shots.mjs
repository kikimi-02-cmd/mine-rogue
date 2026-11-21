// 画面の写しを撮る。使い方: npm run build && npx next start -p 3100 & ; node scripts/shots.mjs <出力フォルダ> [scene...]
// scene: title / play / gameover / stats / daily / deep / codex（無いものは飛ばす）
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright"); // NODE_PATH=$(npm root -g) で全体の playwright を使う
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "shots";
const SCENES = process.argv.slice(3);
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const SIZES = [
  { name: "390x844", width: 390, height: 844 },
  { name: "960x540", width: 960, height: 540 },
];
fs.mkdirSync(OUT, { recursive: true });

async function toGameOver(page) {
  // 盤のマスを順に開け続けて地雷を踏む（盤の中の button を対象）
  for (let i = 0; i < 400; i++) {
    if (await page.getByText("GAME OVER").count()) return true;
    const cells = page.locator("[data-cell='hidden']");
    const n = await cells.count();
    if (n === 0) {
      // スキル選択など: 最初の選択肢を取る
      const pick = page.locator("[data-skill-choice]").first();
      if (await pick.count()) await pick.click();
      await page.waitForTimeout(300);
      continue;
    }
    await cells.nth(Math.floor(Math.random() * n)).click({ force: true });
    await page.waitForTimeout(60);
  }
  return false;
}

const browser = await chromium.launch();
for (const size of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 2,
  });
  // SEED='{"mine_rogue_best_floor":"6"}' で保存の中身を最初に入れておける（既にあれば上書きしない）
  if (process.env.SEED) {
    await ctx.addInitScript((seed) => {
      for (const [k, v] of Object.entries(JSON.parse(seed))) {
        if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
      }
    }, process.env.SEED);
  }
  const page = await ctx.newPage();
  const shot = (scene) =>
    page.screenshot({ path: path.join(OUT, `${scene}-${size.name}.png`) });
  const want = (s) => SCENES.length === 0 || SCENES.includes(s);

  await page.goto(BASE);
  await page.waitForTimeout(700);
  if (want("title")) await shot("title");
  // ログインボーナスの知らせが出ていれば閉じる
  if (await page.locator("[data-welcome-close]").count()) {
    await page.locator("[data-welcome-close]").click();
    await page.waitForTimeout(300);
    if (want("title")) await shot("title-after");
  }
  if (want("stats") && (await page.getByText("📊 統計").count())) {
    await page.getByText("📊 統計").click();
    await page.waitForTimeout(400);
    await shot("stats");
    await page.goto(BASE);
    await page.waitForTimeout(500);
  }
  if (want("codex") && (await page.getByText("📘 図鑑").count())) {
    await page.getByText("📘 図鑑").click();
    await page.waitForTimeout(400);
    await shot("codex");
    await page.goto(BASE);
    await page.waitForTimeout(500);
  }
  if (want("deep") && (await page.locator("[data-deep-start]").count())) {
    await page.locator("[data-deep-start]").click();
    await page.waitForTimeout(500);
    await shot("deep");
    await page.goto(BASE);
    await page.waitForTimeout(500);
  }
  if (want("daily") && (await page.locator("[data-daily-start]").count())) {
    await page.locator("[data-daily-start]").click();
    await page.waitForTimeout(500);
    await shot("daily");
    await page.goto(BASE);
    await page.waitForTimeout(500);
  }
  await page.locator("[data-start]").first().click();
  await page.waitForTimeout(500);
  if (want("play")) await shot("play");
  if (want("gameover")) {
    if (await toGameOver(page)) {
      await page.waitForTimeout(500);
      await shot("gameover");
    }
  }
  await ctx.close();
}
await browser.close();
console.log("saved to", OUT);
