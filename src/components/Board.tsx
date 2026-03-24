import Cell from './Cell';
import type { Cell as CellType } from '@/lib/types';

interface Props {
  board: CellType[][];
  boardSize: number;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  flagMode?: boolean;
  xrayMode?: boolean;
}

export default function Board({ board, boardSize, onReveal, onFlag, flagMode, xrayMode }: Props) {
  const maxWidth = 320;
  const gap = 2;
  const cellSize = Math.floor((maxWidth - gap * (boardSize - 1)) / boardSize);

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: `${gap}px` }}
    >
      {board.map((row, y) => (
        <div key={y} className="flex" style={{ gap: `${gap}px` }}>
          {row.map((cell, x) => (
            <Cell
              key={x}
              cell={cell}
              x={x}
              y={y}
              onReveal={onReveal}
              onFlag={onFlag}
              flagMode={flagMode}
              xrayMode={xrayMode}
              cellSize={cellSize}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
