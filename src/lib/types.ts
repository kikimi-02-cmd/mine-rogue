export type CellState = "hidden" | "revealed" | "flagged";

export interface Cell {
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 1 | 2 | 3;
  type: "active" | "passive";
  used: boolean;
}

export type GamePhase =
  | "title"
  | "playing"
  | "cleared"
  | "skillSelect"
  | "gameOver"
  | "stats"
  | "codex";

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
  /** normal = ふつうのラン / daily = 毎日の挑戦（日付のたね） / deep = 深層モード */
  mode: RunMode;
  /** 毎日の挑戦の日付（YYYY-MM-DD） */
  dateKey: string | null;
  /** 灯り（最初のフロアで安全なマスを開ける回数） */
  lanterns: number;
}

export type RunMode = "normal" | "daily" | "deep";
