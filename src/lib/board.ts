import type { Cell } from './types';

export function createEmptyBoard(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      isMine: false,
      adjacentMines: 0,
      state: 'hidden' as const,
    }))
  );
}

export function generateBoard(
  size: number,
  mineCount: number,
  firstX: number,
  firstY: number
): Cell[][] {
  const board = createEmptyBoard(size);

  // 最初にクリックしたセルとその周囲8セルは安全ゾーン
  const safeZone = new Set<string>();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = firstX + dx;
      const ny = firstY + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        safeZone.add(`${nx},${ny}`);
      }
    }
  }

  // 地雷をランダム配置
  let placed = 0;
  while (placed < mineCount) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (!board[y][x].isMine && !safeZone.has(`${x},${y}`)) {
      board[y][x].isMine = true;
      placed++;
    }
  }

  // 隣接地雷数を計算
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!board[y][x].isMine) {
        board[y][x].adjacentMines = countAdjacent(board, x, y, size);
      }
    }
  }

  return board;
}

function countAdjacent(board: Cell[][], x: number, y: number, size: number): number {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx].isMine) {
        count++;
      }
    }
  }
  return count;
}

export function floodReveal(board: Cell[][], x: number, y: number, size: number): Cell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[x, y]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    const key = `${cx},${cy}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = next[cy][cx];
    if (cell.state === 'flagged' || cell.state === 'revealed') continue;
    if (cell.isMine) continue;

    cell.state = 'revealed';

    if (cell.adjacentMines === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return next;
}

export function isCleared(board: Cell[][], size: number): boolean {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = board[y][x];
      if (!cell.isMine && cell.state !== 'revealed') return false;
    }
  }
  return true;
}

export function countFlags(board: Cell[][], size: number): number {
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x].state === 'flagged') count++;
    }
  }
  return count;
}

export function getFloorConfig(floor: number): { size: number; mineCount: number } {
  const configs: { size: number; mineCount: number }[] = [
    { size: 5, mineCount: 3 },
    { size: 6, mineCount: 5 },
    { size: 7, mineCount: 8 },
    { size: 8, mineCount: 12 },
    { size: 9, mineCount: 16 },
  ];
  if (floor <= 5) return configs[floor - 1];
  return { size: 9, mineCount: 16 + floor };
}
