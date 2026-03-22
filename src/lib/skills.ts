import skillsData from '@/data/skills.json';
import type { Skill } from './types';
import type { Cell } from './types';

interface SkillDef {
  id: string;
  name: string;
  description: string;
  rarity: 1 | 2 | 3;
  type: 'active' | 'passive';
}

export function getRandomSkillChoices(count: number = 3): Skill[] {
  const pool = skillsData as SkillDef[];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s) => ({ ...s, used: false }));
}

export function applyDetector(board: Cell[][], size: number): Cell[][] {
  // ランダムな未フラグ地雷にフラグを自動設置
  const mines: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x].isMine && board[y][x].state !== 'flagged') {
        mines.push([x, y]);
      }
    }
  }
  if (mines.length === 0) return board;
  const [mx, my] = mines[Math.floor(Math.random() * mines.length)];
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  next[my][mx].state = 'flagged';
  return next;
}

export function applyDoubleFlag(board: Cell[][], x: number, y: number, size: number): Cell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (next[ny][nx].isMine && next[ny][nx].state !== 'flagged') {
          next[ny][nx].state = 'flagged';
        }
      }
    }
  }
  return next;
}

export function getAutoRevealCells(board: Cell[][], size: number, count: number): [number, number][] {
  const safe: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!board[y][x].isMine && board[y][x].state === 'hidden') {
        safe.push([x, y]);
      }
    }
  }
  const shuffled = safe.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function rarityColor(rarity: 1 | 2 | 3): string {
  if (rarity === 1) return 'border-emerald-500 bg-emerald-950';
  if (rarity === 2) return 'border-blue-500 bg-blue-950';
  return 'border-violet-500 bg-violet-950';
}

export function rarityLabel(rarity: 1 | 2 | 3): string {
  return '★'.repeat(rarity);
}
