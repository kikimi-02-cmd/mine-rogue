'use client';
import { useRef, useState } from 'react';
import type { Cell as CellType } from '@/lib/types';

const LONG_PRESS_MS = 800;

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
  const [pressing, setPressing] = useState(false);
  // null = タイマー未起動 or 発火済み、non-null = タイマー待機中
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // タッチイベントが発生したかどうか（ゴーストclickをブロックするため）
  const hasTouchRef = useRef(false);

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    hasTouchRef.current = true;
    setPressing(true);
    timerRef.current = setTimeout(() => {
      // 長押し完了: timerRef.current を null にしてから onFlag 呼び出し
      timerRef.current = null;
      setPressing(false);
      onFlag(x, y);
    }, LONG_PRESS_MS);
  }

  function handleTouchEnd() {
    if (timerRef.current !== null) {
      // タイマーがまだ生きている → 800ms未満のタップ
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setPressing(false);
      onReveal(x, y);
    } else {
      // タイマーが発火済み → 長押し完了、onFlag は既に呼ばれている
      setPressing(false);
    }
  }

  function handleTouchMove() {
    // スクロール操作との競合防止: 長押しキャンセル
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
  }

  function handleClick() {
    // タッチ操作後に発生するゴーストclickをブロック
    if (hasTouchRef.current) {
      hasTouchRef.current = false;
      return;
    }
    // PC（マウス）クリックのみここに到達
    onReveal(x, y);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    // PC右クリックで旗トグル
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
        className={`flex items-center justify-center rounded border text-sm cursor-pointer select-none transition-colors
          ${pressing
            ? 'bg-[#6B7280] border-gray-400'
            : 'bg-[#374151] border-yellow-600'
          }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        🚩
      </div>
    );
  }

  // xrayMode（隠れている地雷を透視表示）
  if (xrayMode) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded bg-violet-800 border border-violet-500 cursor-crosshair text-xs select-none animate-pulse"
        onClick={() => onReveal(x, y)}
      >
        ?
      </div>
    );
  }

  // hidden（通常の未開封セル）
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded border text-sm cursor-pointer select-none transition-colors
        ${pressing
          ? 'bg-[#6B7280] border-gray-400'
          : 'bg-[#374151] border-gray-600 hover:bg-[#4B5563] active:bg-[#6B7280]'
        }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
    </div>
  );
}
