import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registerVisit, EMPTY_STREAK, lanternsForStreak, dailyRandom, daysBetween,
  weekStart, bucketStreak, dailyNumber,
} from "../src/lib/daily.ts";

test("同じ日付・フロアなら同じ乱数の並び、違えば違う", () => {
  const a = dailyRandom("2026-11-21", 1, "board");
  const b = dailyRandom("2026-11-21", 1, "board");
  const c = dailyRandom("2026-11-22", 1, "board");
  const sa = [a(), a(), a()];
  assert.deepEqual(sa, [b(), b(), b()]);
  assert.notDeepEqual(sa, [c(), c(), c()]);
  for (const v of sa) assert.ok(v >= 0 && v < 1);
});

test("日数の差・週の月曜・番号", () => {
  assert.equal(daysBetween("2026-11-30", "2026-12-01"), 1);
  assert.equal(weekStart("2026-11-21"), "2026-11-16"); // 土曜 → 月曜
  assert.equal(weekStart("2026-11-16"), "2026-11-16");
  assert.equal(dailyNumber("2026-11-21"), 1);
  assert.equal(dailyNumber("2026-11-23"), 3);
});

test("はじめての日: 連続1・灯り1・お休み券1", () => {
  const r = registerVisit(EMPTY_STREAK, "2026-11-21");
  assert.equal(r.firstVisitToday, true);
  assert.equal(r.streak.count, 1);
  assert.equal(r.lanterns, 1);
  assert.equal(r.streak.freezes, 1);
});

test("同じ日に2回目は報酬なし", () => {
  const r1 = registerVisit(EMPTY_STREAK, "2026-11-21");
  const r2 = registerVisit(r1.streak, "2026-11-21");
  assert.equal(r2.firstVisitToday, false);
  assert.equal(r2.lanterns, 0);
  assert.equal(r2.streak.count, 1);
});

test("翌日で連続+1", () => {
  const r1 = registerVisit(EMPTY_STREAK, "2026-11-21");
  const r2 = registerVisit(r1.streak, "2026-11-22");
  assert.equal(r2.streak.count, 2);
});

test("1日抜けてもお休み券で続く", () => {
  const r1 = registerVisit(EMPTY_STREAK, "2026-11-21");
  const r2 = registerVisit(r1.streak, "2026-11-23");
  assert.equal(r2.freezesUsed, 1);
  assert.equal(r2.streak.count, 2);
  assert.equal(r2.streakBroken, false);
});

test("お休み券が足りなければ1から。久しぶりなら「おかえり」", () => {
  let s = registerVisit(EMPTY_STREAK, "2026-11-16").streak;
  s = registerVisit(s, "2026-11-17").streak;
  const r = registerVisit(s, "2026-11-21"); // 3日抜け、券1枚
  assert.equal(r.streak.count, 1);
  assert.equal(r.streakBroken, true);
  assert.equal(r.welcomeBack, true);
  assert.equal(r.streak.best, 2);
});

test("お休み券は週1枚・上限2枚", () => {
  let s = EMPTY_STREAK;
  for (const d of ["2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23"]) {
    s = registerVisit(s, d).streak;
  }
  assert.ok(s.freezes <= 2);
});

test("灯りは連続で増えて上限3", () => {
  assert.equal(lanternsForStreak(1), 1);
  assert.equal(lanternsForStreak(3), 1);
  assert.equal(lanternsForStreak(4), 2);
  assert.equal(lanternsForStreak(7), 3);
  assert.equal(lanternsForStreak(100), 3);
});

test("連続の日数の丸め", () => {
  assert.equal(bucketStreak(1), "1");
  assert.equal(bucketStreak(5), "4-7");
  assert.equal(bucketStreak(40), "31+");
});
