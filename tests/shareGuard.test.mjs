import { test } from "node:test";
import assert from "node:assert/strict";
import { guardShareText, containsBannedService } from "../src/lib/shareGuard.ts";

test("ふつうの結果の文はそのまま通る", () => {
  const text = "Mine Rogue ⛏\n到達: B5F\nスキル: 🛡👁\n⏱ 01:23\n#MineRogue\nhttps://mine-rogue.vercel.app/";
  assert.equal(guardShareText(text), text);
});

test("𝕏 や サービス名を落とす", () => {
  assert.equal(guardShareText("𝕏 でシェア"), "でシェア");
  assert.equal(guardShareText("Twitterで見てね"), "で見てね");
  assert.equal(guardShareText("LINE と Instagram と TikTok"), "と と");
  assert.equal(guardShareText("YouTube Facebook Threads Discord Reddit 結果"), "結果");
  assert.equal(guardShareText("ツイッター インスタ ユーチューブ 結果"), "結果");
});

test("単独の X は落とし、英単語の一部は残す", () => {
  assert.equal(guardShareText("X で結果を見せる"), "で結果を見せる");
  assert.equal(guardShareText("MAX online deadline"), "MAX online deadline");
});

test("他サービスのリンクを落とす", () => {
  assert.equal(
    guardShareText("結果 https://twitter.com/intent/tweet?text=a\nhttps://mine-rogue.vercel.app/"),
    "結果\nhttps://mine-rogue.vercel.app/",
  );
  assert.equal(guardShareText("https://x.com/abc 見て"), "見て");
});

test("飾り文字で書かれた名前は落とせなければ共有しない（fail-closed）", () => {
  assert.equal(guardShareText("Ｔｗｉｔｔｅｒ で"), null);
  assert.equal(guardShareText("Ｘ"), null);
});

test("全部消えたら共有しない", () => {
  assert.equal(guardShareText("𝕏 Twitter"), null);
});

test("containsBannedService は何度呼んでも同じ答え（lastIndex の持ち越し無し）", () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(containsBannedService("Twitter"), true);
    assert.equal(containsBannedService("ふつう"), false);
  }
});
