const BEST_FLOOR_KEY = 'mine_rogue_best_floor';

export function loadBestFloor(): number {
  if (typeof window === 'undefined') return 1;
  const val = localStorage.getItem(BEST_FLOOR_KEY);
  return val ? parseInt(val, 10) : 1;
}

export function saveBestFloor(floor: number): void {
  if (typeof window === 'undefined') return;
  const current = loadBestFloor();
  if (floor > current) {
    localStorage.setItem(BEST_FLOOR_KEY, String(floor));
  }
}
