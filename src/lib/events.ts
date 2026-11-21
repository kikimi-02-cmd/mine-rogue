// 計測のイベント名と、送る値の丸め（純粋な関数だけ）。
// 個人の情報は送らない。到達フロア・連続の日数は丸めて送る。

export type RunModeName = "normal" | "daily" | "deep";

export const EVENTS = {
  runStart: "run_start",
  floorClear: "floor_clear",
  runEnd: "run_end",
  dailyDone: "daily_done",
  shareCard: "share_card",
  /** 共有のボタンを押した（開始） */
  shareStart: "share_start",
  /** 共有が終わった（outcome: shared / fallback / cancelled / blocked / save） */
  shareDone: "share_done",
  loginReward: "login_reward",
  /** その日はじめて開いた（first_date と today の組で継続率を数える。個人の ID は使わない） */
  visitDay: "visit_day",
} as const;

/** 到達フロアを丸める（1-2 / 3-4 / 5-7 / 8-10 / 11-15 / 16-20 / 21+） */
export function bucketFloor(floor: number): string {
  const f = Math.max(1, Math.floor(floor));
  if (f <= 2) return "1-2";
  if (f <= 4) return "3-4";
  if (f <= 7) return "5-7";
  if (f <= 10) return "8-10";
  if (f <= 15) return "11-15";
  if (f <= 20) return "16-20";
  return "21+";
}

/** 遊んだ時間を丸める（分） */
export function bucketMinutes(seconds: number): string {
  const m = seconds / 60;
  if (m < 1) return "<1";
  if (m < 3) return "1-3";
  if (m < 5) return "3-5";
  if (m < 10) return "5-10";
  if (m < 20) return "10-20";
  return "20+";
}

/** 初回の日からの日数を丸める（D0 / D1 / D2-3 / D4-7 / D8-14 / D15-30 / D31+） */
export function bucketDaysSinceFirst(days: number): string {
  const d = Math.max(0, Math.floor(days));
  if (d === 0) return "D0";
  if (d === 1) return "D1";
  if (d <= 3) return "D2-3";
  if (d <= 7) return "D4-7";
  if (d <= 14) return "D8-14";
  if (d <= 30) return "D15-30";
  return "D31+";
}
