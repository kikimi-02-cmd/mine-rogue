import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENTS } from "../src/lib/events.ts";

test("共有の開始と完了を数える", () => {
  assert.equal(EVENTS.shareStart, "share_start");
  assert.equal(EVENTS.shareDone, "share_done");
});
