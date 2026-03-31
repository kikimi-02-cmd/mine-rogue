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
  1: "#3B82F6",
  2: "#22C55E",
  3: "#EF4444",
  4: "#A855F7",
  5: "#F97316",
  6: "#06B6D4",
  7: "#1E293B",
  8: "#6B7280",
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
  const fontSize = Math.max(12, Math.floor(cellSize * 0.55));

  if (cell.state === "revealed") {
    if (cell.isMine) {
      return (
        <div
          style={baseStyle}
          className="flex items-center justify-center bg-red-700/90 border border-red-500 select-none animate-pulse rounded-sm"
        >
          <span style={{ fontSize: Math.floor(fontSize * 0.85) }}>💣</span>
        </div>
      );
    }
    const color =
      cell.adjacentMines > 0 ? NUMBER_COLORS[cell.adjacentMines] : undefined;
    return (
      <div
        style={baseStyle}
        className="flex items-center justify-center bg-[#1E293B] border border-[#334155] select-none rounded-sm"
      >
        {cell.adjacentMines > 0 && (
          <span style={{ fontSize, color, fontWeight: 800, lineHeight: 1 }}>
            {cell.adjacentMines}
          </span>
        )}
      </div>
    );
  }

  if (cell.state === "flagged") {
    return (
      <div
        style={baseStyle}
        className="flex items-center justify-center bg-[#2A2415] border border-yellow-500/50 cursor-pointer select-none rounded-sm"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span style={{ fontSize: Math.floor(fontSize * 0.85) }}>🚩</span>
      </div>
    );
  }

  if (xrayMode) {
    return (
      <div
        style={baseStyle}
        className="flex items-center justify-center bg-violet-800 border border-violet-400 cursor-crosshair select-none animate-pulse rounded-sm"
        onClick={() => onReveal(x, y)}
      >
        <span
          style={{
            fontSize: Math.floor(fontSize * 0.65),
            color: "#C4B5FD",
            fontWeight: 700,
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
        background: "linear-gradient(145deg, #5E7A9A 0%, #3D5470 100%)",
        boxShadow:
          "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.25)",
      }}
      className="flex items-center justify-center rounded-sm cursor-pointer select-none border border-[#1A2D45]/80 hover:brightness-125 active:brightness-75 transition-[filter] duration-75"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    />
  );
}
