// 毎日戻る仕組み（純粋な関数だけ。保存は storage 側）。
// - 日付のたね: 同じ日付なら全員同じ盤・スキルの並び
// - 連続の日数: その日はじめて開いたら数える。抜けた日はお休み券（週1枚・自動・最大2枚）で埋める
// - ログイン報酬: その日はじめて開いたら「灯り」（最初のフロアで安全なマスを開ける）。連続で少し増える。上限あり

/** 端末の日付（現地）を YYYY-MM-DD で */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD 同士の日数の差（b - a） */
export function daysBetween(a: string, b: string): number {
  const pa = a.split("-").map(Number);
  const pb = b.split("-").map(Number);
  const ta = Date.UTC(pa[0], pa[1] - 1, pa[2]);
  const tb = Date.UTC(pb[0], pb[1] - 1, pb[2]);
  return Math.round((tb - ta) / 86400000);
}

/** 文字列から 32bit のたね */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** たねつき乱数（mulberry32）。0 以上 1 未満 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 毎日の挑戦の、そのフロア・その用途の乱数 */
export function dailyRandom(dateKey: string, floor: number, purpose: "board" | "skills"): () => number {
  return seededRandom(hashSeed(`mine-rogue:${dateKey}:${floor}:${purpose}`));
}

/** 毎日の挑戦の番号（初日 = 1） */
export const DAILY_EPOCH = "2026-11-21";
export function dailyNumber(dateKey: string): number {
  return Math.max(1, daysBetween(DAILY_EPOCH, dateKey) + 1);
}

// ─── 連続の日数・お休み券・ログイン報酬 ─────────────────

export interface StreakState {
  /** 最後に開いた日 */
  lastDate: string | null;
  /** 連続の日数 */
  count: number;
  /** 一番長かった連続 */
  best: number;
  /** お休み券の枚数 */
  freezes: number;
  /** 最後にお休み券を配った週（その週の月曜の日付） */
  freezeWeek: string | null;
}

export const EMPTY_STREAK: StreakState = {
  lastDate: null,
  count: 0,
  best: 0,
  freezes: 0,
  freezeWeek: null,
};

export const MAX_FREEZES = 2;
export const MAX_LANTERNS = 3;

/** その日が属する週の月曜（YYYY-MM-DD） */
export function weekStart(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  const dow = (t.getUTCDay() + 6) % 7; // 月曜 = 0
  t.setUTCDate(t.getUTCDate() - dow);
  return t.toISOString().slice(0, 10);
}

/** 連続の日数に応じた灯りの数（1〜3） */
export function lanternsForStreak(count: number): number {
  return Math.min(MAX_LANTERNS, 1 + Math.floor(Math.max(0, count - 1) / 3));
}

export interface VisitResult {
  streak: StreakState;
  /** その日はじめて開いたか */
  firstVisitToday: boolean;
  /** 今回もらえる灯り（0 = なし） */
  lanterns: number;
  /** お休み券を使った枚数 */
  freezesUsed: number;
  /** 連続が途切れたか */
  streakBroken: boolean;
  /** 久しぶり（3 日以上空いた）か */
  welcomeBack: boolean;
  /** 今週分のお休み券を配ったか */
  freezeGranted: boolean;
}

/** 開いた日を記録する（同じ日に何度呼んでも 2 回目以降は何もしない） */
export function registerVisit(prev: StreakState, today: string): VisitResult {
  const s: StreakState = { ...prev };
  let freezeGranted = false;
  const wk = weekStart(today);
  if (s.freezeWeek !== wk) {
    if (s.freezes < MAX_FREEZES) {
      s.freezes += 1;
      freezeGranted = true;
    }
    s.freezeWeek = wk;
  }

  if (s.lastDate === today) {
    return {
      streak: s,
      firstVisitToday: false,
      lanterns: 0,
      freezesUsed: 0,
      streakBroken: false,
      welcomeBack: false,
      freezeGranted,
    };
  }

  let freezesUsed = 0;
  let streakBroken = false;
  let welcomeBack = false;
  if (s.lastDate === null) {
    s.count = 1;
  } else {
    const gap = daysBetween(s.lastDate, today);
    if (gap <= 0) {
      // 端末の時計が戻った等。数えずに今日として扱う
      s.count = Math.max(1, s.count);
    } else if (gap === 1) {
      s.count += 1;
    } else {
      const missed = gap - 1;
      welcomeBack = gap >= 3;
      if (missed <= s.freezes) {
        s.freezes -= missed;
        freezesUsed = missed;
        s.count += 1;
      } else {
        streakBroken = s.count > 1;
        s.count = 1;
      }
    }
  }
  s.lastDate = today;
  s.best = Math.max(s.best, s.count);
  return {
    streak: s,
    firstVisitToday: true,
    lanterns: lanternsForStreak(s.count),
    freezesUsed,
    streakBroken,
    welcomeBack,
    freezeGranted,
  };
}

/** 計測用に連続の日数を丸める（個人を特定しにくくする） */
export function bucketStreak(n: number): string {
  if (n <= 1) return "1";
  if (n <= 3) return "2-3";
  if (n <= 7) return "4-7";
  if (n <= 14) return "8-14";
  if (n <= 30) return "15-30";
  return "31+";
}
