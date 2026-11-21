import { test } from "node:test";
import assert from "node:assert/strict";
import { bucketFloor, bucketMinutes, EVENTS } from "../src/lib/events.ts";

test("到達フロアの丸め", () => {
  assert.equal(bucketFloor(0), "1-2");
  assert.equal(bucketFloor(2), "1-2");
  assert.equal(bucketFloor(5), "5-7");
  assert.equal(bucketFloor(10), "8-10");
  assert.equal(bucketFloor(99), "21+");
});

test("時間の丸め", () => {
  assert.equal(bucketMinutes(30), "<1");
  assert.equal(bucketMinutes(400), "5-10");
  assert.equal(bucketMinutes(5000), "20+");
});

test("イベント名は指示どおり", () => {
  assert.deepEqual(Object.values(EVENTS).sort(), [
    "daily_done", "floor_clear", "login_reward", "run_end", "run_start", "share_card",
    "visit_day",
  ]);
});

test("初回の日からの日数の丸め", async () => {
  const { bucketDaysSinceFirst } = await import("../src/lib/events.ts");
  assert.equal(bucketDaysSinceFirst(0), "D0");
  assert.equal(bucketDaysSinceFirst(1), "D1");
  assert.equal(bucketDaysSinceFirst(7), "D4-7");
  assert.equal(bucketDaysSinceFirst(30), "D15-30");
  assert.equal(bucketDaysSinceFirst(99), "D31+");
});
