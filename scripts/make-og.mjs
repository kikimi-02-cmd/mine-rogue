// 次回用: リンクの絵（OG 画像 1200×630）を作り直す。
// 使い方: NODE_PATH=$(npm root -g) node scripts/make-og.mjs  → app/opengraph-image.png
// 遊び方が一目で分かるように: 数字のマス・旗・地雷・スキルを 1 枚に
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright"); // NODE_PATH=$(npm root -g) で全体の playwright を使う
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const B = [
  "1 1 1 . . .",
  "1 F 1 . 1 1",
  "1 1 1 . 1 F",
  ". . 1 1 2 1",
  ". 1 2 F 1 .",
  "# # # # # #",
];
const cell = (c) => {
  if (c === "#") return `<div class="c h"></div>`;
  if (c === "F") return `<div class="c h">🚩</div>`;
  if (c === ".") return `<div class="c o"></div>`;
  const col = { 1: "#60A5FA", 2: "#34D399" }[c];
  return `<div class="c o" style="color:${col}">${c}</div>`;
};
const board = B.map((r) => r.split(" ").map(cell).join("")).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:"Hiragino Sans","Noto Sans CJK JP","Noto Sans JP",sans-serif;
 background:radial-gradient(ellipse at 30% 0%,#14365C,#0A1628 70%);color:#E2E8F0;display:flex;align-items:center;padding:0 70px;gap:60px}
.l{flex:1}
h1{font-size:82px;white-space:nowrap;font-weight:900;letter-spacing:-2px;line-height:1}
h1 b{color:#34D399}
.t{margin-top:18px;font-size:34px;font-weight:800;color:#CBD5E1}
ul{list-style:none;padding:0;margin-top:34px;display:flex;flex-direction:column;gap:14px}
li{font-size:27px;font-weight:700;display:flex;gap:14px;align-items:center}
li span{display:inline-flex;width:46px;height:46px;border-radius:12px;background:#16243A;align-items:center;justify-content:center;font-size:26px}
.f{margin-top:34px;display:inline-block;background:#10B981;color:#fff;font-weight:900;font-size:28px;padding:12px 28px;border-radius:16px}
.g{display:grid;grid-template-columns:repeat(6,72px);gap:6px;padding:14px;border-radius:22px;background:#15233A;border:2px solid #1E3A5F;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.c{width:72px;height:72px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900}
.h{background:linear-gradient(150deg,#4E6F94,#2C4361)}
.o{background:#0E1A2C}
.r{position:relative}
.sk{position:absolute;right:-26px;bottom:-30px;display:flex;gap:10px}
.sk div{width:70px;height:70px;border-radius:18px;background:#16243A;border:3px solid #A855F7;display:flex;align-items:center;justify-content:center;font-size:38px}
</style></head><body>
<div class="l">
 <h1>MINE <b>ROGUE</b></h1>
 <p class="t">地雷の盤を潜るローグライク</p>
 <ul>
  <li><span style="color:#60A5FA">1</span>数字 = 周りの地雷の数</li>
  <li><span>✨</span>クリアごとにスキルを1つ</li>
  <li><span>📅</span>毎日の挑戦・深層モード</li>
 </ul>
 <p class="f">ブラウザで無料・すぐ遊べる</p>
</div>
<div class="r"><div class="g">${board}</div>
 <div class="sk"><div>🛡</div><div style="border-color:#3B82F6">👁</div><div style="border-color:#10B981">🍀</div></div>
</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html);
  await p.waitForTimeout(300);
  const out = path.join(__dirname, "..", "app", "opengraph-image.png");
  await p.screenshot({ path: out });
  await b.close();
  console.log("saved", out);
})();
