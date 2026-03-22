export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface Cell {
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  rarity: 1 | 2 | 3;
  type: 'active' | 'passive';
  used: boolean;
}

export type GamePhase = 'playing' | 'cleared' | 'skillSelect' | 'gameOver';

export interface GameState {
  floor: number;
  board: Cell[][];
  boardSize: number;
  mineCount: number;
  skills: Skill[];
  gamePhase: GamePhase;
  timer: number;
  bestFloor: number;
  firstClick: boolean;
  pendingMineReduction: number;
  pendingAutoReveal: number;
}
