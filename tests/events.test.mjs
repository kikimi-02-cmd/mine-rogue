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
    "share_done", "share_start",
  ]);
});
