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
