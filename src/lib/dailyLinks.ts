// 逃した日のお題・招待のリンク（純粋な関数だけ）
import { daysBetween, DAILY_EPOCH } from "./daily.ts";

/** 後から遊べるお題の日数（記録は 60 日分残すので、その内側） */
export const PAST_DAILY_DAYS = 7;

/** 遊べるお題の日付か（形が正しく、初日〜今日、60 日以内） */
export function isPlayableDailyKey(key: string, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return false;
  const age = daysBetween(key, today);
  return age >= 0 && age < 60 && daysBetween(DAILY_EPOCH, key) >= 0;
}

/** 今日より前の、後から遊べるお題の日付（新しい順） */
export function pastDailyKeys(today: string, days: number = PAST_DAILY_DAYS): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const out: string[] = [];
  for (let i = 1; i <= days; i++) {
    const t = new Date(Date.UTC(y, m - 1, d - i));
    const key = t.toISOString().slice(0, 10);
    if (isPlayableDailyKey(key, today)) out.push(key);
  }
  return out;
}

/** 招待のリンクのクエリ（?d=YYYY-MM-DD）から日付を取り出す */
export function dailyKeyFromSearch(search: string, today: string): string | null {
  const key = new URLSearchParams(search).get("d");
  return key && isPlayableDailyKey(key, today) ? key : null;
}

/** 共有のリンク: 毎日の挑戦なら同じお題を開く ?d= をつける */
export function dailyShareUrl(siteUrl: string, dateKey?: string | null): string {
  return dateKey ? `${siteUrl}?d=${dateKey}` : siteUrl;
}
