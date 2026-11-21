import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENTS, bucketDaysSinceFirst } from "../src/lib/events.ts";

test("継続率のイベント名", () => {
  assert.equal(EVENTS.visitDay, "visit_day");
});

test("初回の日からの日数の丸め", () => {
  assert.equal(bucketDaysSinceFirst(0), "D0");
  assert.equal(bucketDaysSinceFirst(1), "D1");
  assert.equal(bucketDaysSinceFirst(7), "D4-7");
  assert.equal(bucketDaysSinceFirst(30), "D15-30");
  assert.equal(bucketDaysSinceFirst(99), "D31+");
});
