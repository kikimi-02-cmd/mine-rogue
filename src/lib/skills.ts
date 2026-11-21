import skillsData from "@/data/skills.json";
import type { Skill } from "./types";
import type { Cell } from "./types";

interface SkillDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 1 | 2 | 3;
  type: "active" | "passive";
}

/** 並べ替え（Fisher–Yates）。たねつき乱数でもブラウザによらず同じ結果になる */
export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getRandomSkillChoices(
  count: number = 3,
  hasLucky: boolean = false,
  rand: () => number = Math.random,
  available: (id: string) => boolean = () => true,
): Skill[] {
  const pool = (skillsData as SkillDef[]).filter((s) => available(s.id));
  if (hasLucky) {
    const rare = shuffle(pool.filter((s) => s.rarity === 3), rand);
    const nonRare = shuffle(pool.filter((s) => s.rarity < 3), rand);
    const rest = shuffle([...rare.slice(1), ...nonRare], rand);
    const picked = rare.length > 0 ? [rare[0], ...rest.slice(0, count - 1)] : rest.slice(0, count);
    return picked.map((s) => ({
      ...s,
      used: false,
    }));
  }
  return shuffle(pool, rand)
    .slice(0, count)
    .map((s) => ({ ...s, used: false }));
}

export function applyDetector(
  board: Cell[][],
  size: number,
  rand: () => number = Math.random,
): Cell[][] {
  // ランダムな未フラグ地雷にフラグを自動設置
  const mines: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x].isMine && board[y][x].state !== "flagged") {
        mines.push([x, y]);
      }
    }
  }
  if (mines.length === 0) return board;
  const [mx, my] = mines[Math.floor(rand() * mines.length)];
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  next[my][mx].state = "flagged";
  return next;
}

export function applyDoubleFlag(
  board: Cell[][],
  x: number,
  y: number,
  size: number,
): Cell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (next[ny][nx].isMine && next[ny][nx].state !== "flagged") {
          next[ny][nx].state = "flagged";
        }
      }
    }
  }
  return next;
}

export function getAutoRevealCells(
  board: Cell[][],
  size: number,
  count: number,
): [number, number][] {
  const safe: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!board[y][x].isMine && board[y][x].state === "hidden") {
        safe.push([x, y]);
      }
    }
  }
  return shuffle(safe).slice(0, count);
}
