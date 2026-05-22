"use client";
import type { Cell as CellType } from "@/lib/types";

interface Props {
  cell: CellType;
  x: number;
  y: number;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  flagMode?: boolean;
  xrayMode?: boolean;
  cellSize: number;
}

const NUMBER_COLORS: Record<number, string> = {
  1: "#60A5FA",
  2: "#34D399",
  3: "#F87171",
  4: "#C084FC",
  5: "#FB923C",
  6: "#22D3EE",
  7: "#F472B6",
  8: "#CBD5E1",
};

export default function Cell({
  cell,
  x,
  y,
  onReveal,
  onFlag,
  flagMode,
  xrayMode,
  cellSize,
}: Props) {
  function handleClick() {
    if (flagMode) onFlag(x, y);
    else onReveal(x, y);
  }
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    onFlag(x, y);
  }

  const baseStyle: React.CSSProperties = { width: cellSize, height: cellSize };
  const fontSize = Math.max(13, Math.floor(cellSize * 0.56));

  if (cell.state === "revealed") {
    if (cell.isMine) {
      return (
        <div
          style={baseStyle}
          className="flex items-center justify-center rounded-[3px] border border-red-400/70 select-none animate-mine-reveal"
        >
          <div
            className="flex items-center justify-center w-full h-full rounded-[3px]"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #F87171 0%, #B91C1C 70%)",
            }}
          >
            <span style={{ fontSize: Math.floor(fontSize * 0.88) }}>💣</span>
          </div>
        </div>
      );
    }
    const color =
      cell.adjacentMines > 0 ? NUMBER_COLORS[cell.adjacentMines] : undefined;
    return (
      <div
        style={{
          ...baseStyle,
          background: "#0E1A2C",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.45)",
        }}
        className="flex items-center justify-center border border-[#22334C] select-none rounded-[3px] animate-cell-pop"
      >
        {cell.adjacentMines > 0 && (
          <span
            style={{
              fontSize,
              color,
              fontWeight: 800,
              lineHeight: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.55)",
            }}
          >
            {cell.adjacentMines}
          </span>
        )}
      </div>
    );
  }

  if (cell.state === "flagged") {
    return (
      <div
        style={{
          ...baseStyle,
          background: "linear-gradient(150deg, #3A3415 0%, #241E0C 100%)",
        }}
        className="flex items-center justify-center border border-yellow-500/55 cursor-pointer select-none rounded-[3px] active:brightness-90"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span
          className="animate-flag-pop"
          style={{ fontSize: Math.floor(fontSize * 0.86) }}
        >
          🚩
        </span>
      </div>
    );
  }

  if (xrayMode) {
    return (
      <div
        style={{
          ...baseStyle,
          background: "linear-gradient(150deg, #7C3AED 0%, #5B21B6 100%)",
        }}
        className="flex items-center justify-center border border-violet-300 cursor-crosshair select-none animate-pulse rounded-[3px]"
        onClick={() => onReveal(x, y)}
      >
        <span
          style={{
            fontSize: Math.floor(fontSize * 0.7),
            color: "#EDE9FE",
            fontWeight: 800,
          }}
        >
          ?
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        background: "linear-gradient(150deg, #4E6F94 0%, #2C4361 100%)",
        boxShadow:
          "inset 1.5px 1.5px 0 rgba(255,255,255,0.18), inset -1.5px -1.5px 0 rgba(0,0,0,0.32)",
      }}
      className="flex items-center justify-center rounded-[3px] cursor-pointer select-none border border-[#18293F] hover:brightness-125 active:brightness-75 active:scale-95 transition-[filter,transform] duration-75"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    />
  );
}
