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
