import { EMPTY_STREAK, MAX_LANTERNS, type StreakState } from "./daily";

const BEST_FLOOR_KEY = "mine_rogue_best_floor";
const PLAY_COUNT_KEY = "mine_rogue_play_count";
const TOTAL_REVEALED_KEY = "mine_rogue_total_revealed";
const SKILL_COUNTS_KEY = "mine_rogue_skill_counts";

export function loadBestFloor(): number {
  if (typeof window === "undefined") return 1;
  const val = localStorage.getItem(BEST_FLOOR_KEY);
  return val ? parseInt(val, 10) : 1;
}

export function saveBestFloor(floor: number): void {
  if (typeof window === "undefined") return;
  const current = loadBestFloor();
  if (floor > current) {
    localStorage.setItem(BEST_FLOOR_KEY, String(floor));
  }
}

export function loadPlayCount(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(PLAY_COUNT_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function incrementPlayCount(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAY_COUNT_KEY, String(loadPlayCount() + 1));
}

export function loadTotalRevealed(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(TOTAL_REVEALED_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function addTotalRevealed(count: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOTAL_REVEALED_KEY, String(loadTotalRevealed() + count));
}

export function loadSkillCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const val = localStorage.getItem(SKILL_COUNTS_KEY);
  try {
    return val ? (JSON.parse(val) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function trackSkills(skills: { id: string }[]): void {
  if (typeof window === "undefined") return;
  const counts = loadSkillCounts();
  for (const skill of skills) {
    counts[skill.id] = (counts[skill.id] ?? 0) + 1;
  }
  localStorage.setItem(SKILL_COUNTS_KEY, JSON.stringify(counts));
}

// ─── 毎日戻る（足すだけ。既存のキーは変えない） ─────────────

const STREAK_KEY = "mine_rogue_streak";
const LANTERN_KEY = "mine_rogue_lanterns";
const DAILY_KEY = "mine_rogue_daily";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? ({ ...fallback, ...JSON.parse(v) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadStreak(): StreakState {
  return readJson<StreakState>(STREAK_KEY, EMPTY_STREAK);
}

export function saveStreak(s: StreakState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

/** 次のランで使える灯り（ログイン報酬） */
export function loadLanterns(): number {
  if (typeof window === "undefined") return 0;
  const v = parseInt(localStorage.getItem(LANTERN_KEY) ?? "0", 10);
  return Number.isFinite(v) ? Math.max(0, Math.min(MAX_LANTERNS, v)) : 0;
}

export function saveLanterns(n: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANTERN_KEY, String(Math.max(0, Math.min(MAX_LANTERNS, n))));
}

export interface DailyRecord {
  date: string;
  floor: number;
  timer: number;
}

/** 日付ごとの毎日の挑戦の記録（1 日 1 回） */
export function loadDailyRecords(): Record<string, DailyRecord> {
  return readJson<Record<string, DailyRecord>>(DAILY_KEY, {});
}

export function loadDailyRecord(date: string): DailyRecord | null {
  return loadDailyRecords()[date] ?? null;
}

export function saveDailyRecord(rec: DailyRecord): boolean {
  if (typeof window === "undefined") return false;
  const all = loadDailyRecords();
  if (all[rec.date]) return false;
  all[rec.date] = rec;
  // 古い記録は 60 日分だけ残す
  const keys = Object.keys(all).sort().slice(-60);
  const kept: Record<string, DailyRecord> = {};
  for (const k of keys) kept[k] = all[k];
  localStorage.setItem(DAILY_KEY, JSON.stringify(kept));
  return true;
}

// ─── 深層モード・解放（足すだけ） ─────────────────────

const DEEP_BEST_KEY = "mine_rogue_deep_best";

export function loadDeepBest(): number {
  if (typeof window === "undefined") return 0;
  const v = parseInt(localStorage.getItem(DEEP_BEST_KEY) ?? "0", 10);
  return Number.isFinite(v) ? v : 0;
}

export function saveDeepBest(floor: number): void {
  if (typeof window === "undefined") return;
  if (floor > loadDeepBest()) localStorage.setItem(DEEP_BEST_KEY, String(floor));
}

/** 解放・称号の判定に使う進み具合（どのモードも含めた一番深い到達と通算のラン数） */
export function loadProgress(): { best: number; plays: number } {
  return {
    best: Math.max(loadBestFloor(), loadDeepBest()),
    plays: loadPlayCount(),
  };
}
