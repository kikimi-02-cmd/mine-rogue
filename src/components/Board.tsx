'use client';
import { useRef } from 'react';
import Cell from './Cell';
import type { Cell as CellType } from '@/lib/types';

interface Props {
  board: CellType[][];
  boardSize: number;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  xrayMode?: boolean;
}

export default function Board({ board, boardSize, onReveal, onFlag, xrayMode }: Props) {
  const maxWidth = 320;
  const gap = 2;
  const cellSize = Math.floor((maxWidth - gap * (boardSize - 1)) / boardSize);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flagMode = useRef(false);
  const lastKey = useRef<string | null>(null);

  function cellFromPoint(clientX: number, clientY: number): { x: number; y: number } | null {
    const el = document.elementFromPoint(clientX, clientY);
    const cellEl = el?.closest('[data-cell]') as HTMLElement | null;
    if (!cellEl) return null;
    const x = Number(cellEl.dataset.cellX);
    const y = Number(cellEl.dataset.cellY);
    if (isNaN(x) || isNaN(y)) return null;
    return { x, y };
  }

  function handleTouchStart(e: React.TouchEvent) {
    flagMode.current = false;
    lastKey.current = null;
    // 座標をコピー（合成イベントは再利用されるため）
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      const coords = cellFromPoint(clientX, clientY);
      if (!coords) return;
      flagMode.current = true;
      const key = `${coords.x},${coords.y}`;
      lastKey.current = key;
      onFlag(coords.x, coords.y);
    }, 500);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!flagMode.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const coords = cellFromPoint(touch.clientX, touch.clientY);
    if (!coords) return;
    const key = `${coords.x},${coords.y}`;
    if (key === lastKey.current) return; // 同じセルは連続してflagしない
    lastKey.current = key;
    onFlag(coords.x, coords.y);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (flagMode.current) {
      e.preventDefault(); // flagMode中はclickイベントを抑制
      flagMode.current = false;
    }
    lastKey.current = null;
  }

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: `${gap}px` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
              xrayMode={xrayMode}
              cellSize={cellSize}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
