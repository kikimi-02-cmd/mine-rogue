import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDeepFloorConfig, titlesFor, currentTitle, nextTitle,
  isSkillAvailable, newlyUnlocked, newlyEarnedTitles,
} from "../src/lib/progress.ts";

test("深層モードの盤は大きく・濃くなり、上限を守る", () => {
  let prevSize = 0;
  for (let f = 1; f <= 40; f++) {
    const c = getDeepFloorConfig(f);
    assert.ok(c.size >= prevSize && c.size <= 10);
    assert.ok(c.mineCount >= 2 && c.mineCount <= c.size * c.size - 9, `floor ${f}`);
    prevSize = c.size;
  }
  assert.equal(getDeepFloorConfig(1).size, 5);
  assert.equal(getDeepFloorConfig(30).size, 10);
  assert.equal(getDeepFloorConfig(5).milestone, true);
  assert.equal(getDeepFloorConfig(6).milestone, false);
  assert.ok(getDeepFloorConfig(20).mineCount > getDeepFloorConfig(12).mineCount);
});

test("称号", () => {
  assert.equal(titlesFor(1).length, 0);
  assert.equal(currentTitle(5).name, "一人前の坑夫");
  assert.equal(nextTitle(5).floor, 8);
  assert.equal(nextTitle(99), null);
  assert.deepEqual(newlyEarnedTitles(4, 9).map((t) => t.floor), [5, 8]);
});

test("解放: 条件を満たすと選択肢に入る", () => {
  const p0 = { best: 1, plays: 0 };
  const p1 = { best: 6, plays: 3 };
  assert.equal(isSkillAvailable("shield", p0), true);
  assert.equal(isSkillAvailable("compass", p0), false);
  assert.equal(isSkillAvailable("compass", p1), true);
  assert.deepEqual(newlyUnlocked(p0, p1).map((u) => u.skillId), ["candle", "compass"]);
});
