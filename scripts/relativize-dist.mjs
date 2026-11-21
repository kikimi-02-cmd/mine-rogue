// 書き出した out/ の中の "/_next/..." "/icon-192.png" などの絶対パスを、index.html から見た相対パスに直す。
// 配信サイトは /html/12345/ のような下の階層に置くため、絶対パスだと読み込めない。
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "out");
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css|json|txt|webmanifest)$/.test(f)) files.push(p);
  }
})(root);

const topLevel = fs.readdirSync(root).filter((f) => f !== "index.html");
let changed = 0;
for (const file of files) {
  const rel = path.relative(path.dirname(file), root) || ".";
  const prefix = rel === "." ? "./" : rel.split(path.sep).join("/") + "/";
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  if (file.endsWith(".html") || file.endsWith(".txt")) {
    // HTML / RSC の中の参照は、そのファイルから見た相対に
    s = s.replace(/(["'(])\/_next\//g, `$1${prefix}_next/`);
    for (const t of topLevel) {
      if (t === "_next") continue;
      s = s.split(`"/${t}"`).join(`"${prefix}${t}"`);
    }
  } else if (file.endsWith(".js")) {
    // JS が後から読み込む chunk は、ページ（index.html）から見た相対に
    s = s.replace(/(["'])\/_next\//g, "$1./_next/");
  } else if (file.endsWith(".css")) {
    // CSS の url() は CSS ファイルから見た相対
    s = s.replace(/url\(\/_next\//g, `url(${prefix}_next/`);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    changed++;
  }
}
console.log(`relativized ${changed} files`);
