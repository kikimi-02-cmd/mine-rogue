import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pastDailyKeys, isPlayableDailyKey, dailyKeyFromSearch, dailyShareUrl,
} from "../src/lib/dailyLinks.ts";

test("逃した日のお題: 初日より前と今日は含めず、新しい順", () => {
  assert.deepEqual(pastDailyKeys("2026-11-21"), []);
  assert.deepEqual(pastDailyKeys("2026-11-23"), ["2026-11-22", "2026-11-21"]);
  assert.equal(pastDailyKeys("2027-01-10").length, 7);
  assert.equal(isPlayableDailyKey("2026-11-24", "2026-11-23"), false); // 未来
  assert.equal(isPlayableDailyKey("2026-02-30", "2026-11-23"), false); // 無い日
  assert.equal(isPlayableDailyKey("2026-11-20", "2026-11-23"), false); // 初日より前
  assert.equal(dailyKeyFromSearch("?d=2026-11-22", "2026-11-23"), "2026-11-22");
  assert.equal(dailyKeyFromSearch("?d=<script>", "2026-11-23"), null);
  assert.equal(dailyKeyFromSearch("", "2026-11-23"), null);
});

test("毎日の挑戦の共有リンクは同じお題を開き、受け取った側で読める", () => {
  const url = dailyShareUrl("https://mine-rogue.vercel.app/", "2026-11-22");
  assert.equal(url, "https://mine-rogue.vercel.app/?d=2026-11-22");
  assert.equal(dailyShareUrl("https://mine-rogue.vercel.app/", null), "https://mine-rogue.vercel.app/");
  assert.equal(dailyKeyFromSearch(new URL(url).search, "2026-11-23"), "2026-11-22");
});
