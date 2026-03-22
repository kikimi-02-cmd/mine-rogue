'use client';
import { useRef } from 'react';
import type { Cell as CellType } from '@/lib/types';

interface Props {
  cell: CellType;
  x: number;
  y: number;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  xrayMode?: boolean;
  cellSize: number;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-emerald-400',
  3: 'text-red-400',
  4: 'text-violet-400',
  5: 'text-yellow-400',
  6: 'text-cyan-400',
  7: 'text-pink-400',
  8: 'text-gray-400',
};

export default function Cell({ cell, x, y, onReveal, onFlag, xrayMode, cellSize }: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  function handleTouchStart() {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onFlag(x, y);
    }, 500);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (didLongPress.current) {
      e.preventDefault();
    }
  }

  function handleClick() {
    if (didLongPress.current) return;
    onReveal(x, y);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    onFlag(x, y);
  }

  const size = `${cellSize}px`;

  if (cell.state === 'revealed') {
    if (cell.isMine) {
      return (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded bg-red-900 border border-red-700 text-sm select-none"
        >
          💣
        </div>
      );
    }
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded bg-[#1F2937] border border-gray-700 font-bold text-sm select-none
          ${cell.adjacentMines > 0 ? NUMBER_COLORS[cell.adjacentMines] ?? 'text-gray-300' : ''}`}
      >
        {cell.adjacentMines > 0 ? cell.adjacentMines : ''}
      </div>
    );
  }

  if (cell.state === 'flagged') {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded bg-[#374151] border border-yellow-600 text-sm cursor-pointer select-none"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        🚩
      </div>
    );
  }

  // hidden
  if (xrayMode) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded bg-violet-800 border border-violet-500 cursor-crosshair text-xs select-none animate-pulse"
        onClick={handleClick}
      >
        ?
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded bg-[#374151] border border-gray-600 cursor-pointer hover:bg-[#4B5563] active:bg-[#6B7280] transition-colors select-none"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
    </div>
  );
}
