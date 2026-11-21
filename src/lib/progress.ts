// 遊びの深さ: 深層モードの盤・到達の節目の称号・ラン同士で残る解放（純粋な関数だけ）。
// 基本のフロアの表（board.ts の getFloorConfig）は変えない。深層モードは別の表を使う。

/** 深層モードの盤: 大きさ 5→10、地雷の密度 12%→26%。5 の倍数のフロアは「節目」で少し濃く、スキルを 2 つ取れる */
export function getDeepFloorConfig(floor: number): {
  size: number;
  mineCount: number;
  milestone: boolean;
} {
  const f = Math.max(1, Math.floor(floor));
  const size = Math.min(10, 5 + Math.floor((f - 1) / 2));
  const milestone = f % 5 === 0;
  const density = Math.min(0.26, 0.12 + (f - 1) * 0.008) + (milestone ? 0.03 : 0);
  const cells = size * size;
  // 最初のマスの周り 9 マスは安全にするため、それより多くは置かない
  const mineCount = Math.max(2, Math.min(cells - 9, Math.round(cells * density)));
  return { size, mineCount, milestone };
}

/** 深層モードが開く条件（ふつうのランのベスト） */
export const DEEP_UNLOCK_FLOOR = 5;

// ─── 称号（到達フロアの節目） ─────────────────────────

export interface TitleDef {
  floor: number;
  name: string;
  icon: string;
}

export const TITLES: TitleDef[] = [
  { floor: 3, name: "見習い坑夫", icon: "🪨" },
  { floor: 5, name: "一人前の坑夫", icon: "⛏️" },
  { floor: 8, name: "深層の探索者", icon: "🔦" },
  { floor: 10, name: "地底の主", icon: "💎" },
  { floor: 15, name: "伝説の坑夫", icon: "👑" },
  { floor: 20, name: "奈落の踏破者", icon: "🌌" },
];

export function titlesFor(best: number): TitleDef[] {
  return TITLES.filter((t) => best >= t.floor);
}

export function currentTitle(best: number): TitleDef | null {
  const got = titlesFor(best);
  return got.length > 0 ? got[got.length - 1] : null;
}

export function nextTitle(best: number): TitleDef | null {
  return TITLES.find((t) => best < t.floor) ?? null;
}

// ─── ラン同士で残る解放（新しいスキルが選択肢に入る） ──────────

export interface Progress {
  /** どのモードも含めた一番深い到達 */
  best: number;
  /** 通算のラン数 */
  plays: number;
}

export interface UnlockDef {
  skillId: string;
  kind: "best" | "plays";
  value: number;
  label: string;
}

export const UNLOCKS: UnlockDef[] = [
  { skillId: "candle", kind: "plays", value: 3, label: "3 回遊ぶ" },
  { skillId: "compass", kind: "best", value: 5, label: "B5F に到達" },
  { skillId: "radar", kind: "best", value: 8, label: "B8F に到達" },
  { skillId: "phoenix", kind: "best", value: 12, label: "B12F に到達" },
];

export function isUnlocked(u: UnlockDef, p: Progress): boolean {
  return u.kind === "best" ? p.best >= u.value : p.plays >= u.value;
}

/** 選択肢に入れてよいスキルか（解放の条件が無いスキルはいつでも可） */
export function isSkillAvailable(skillId: string, p: Progress): boolean {
  const u = UNLOCKS.find((x) => x.skillId === skillId);
  return !u || isUnlocked(u, p);
}

/** before → after で新しく開いたもの */
export function newlyUnlocked(before: Progress, after: Progress): UnlockDef[] {
  return UNLOCKS.filter((u) => !isUnlocked(u, before) && isUnlocked(u, after));
}

export function newlyEarnedTitles(beforeBest: number, afterBest: number): TitleDef[] {
  return TITLES.filter((t) => beforeBest < t.floor && afterBest >= t.floor);
}
