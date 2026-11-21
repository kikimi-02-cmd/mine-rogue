"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import AdUnit from "@/components/AdUnit";
import type { StreakState } from "@/lib/daily";
import type { DailyRecord } from "@/lib/storage";
import { currentTitle, DEEP_UNLOCK_FLOOR } from "@/lib/progress";
import { IS_DIST } from "@/lib/dist";

interface Props {
  bestFloor: number;
  totalPlays: number;
  onStart: () => void;
  onShowStats: () => void;
  streak: StreakState | null;
  lanterns: number;
  dailyNumber: number;
  todayDaily: DailyRecord | null;
  onStartDaily: () => void;
  deepUnlocked: boolean;
  deepBest: number;
  onStartDeep: () => void;
  onShowCodex: () => void;
  bestOverall: number;
  /** その日はじめて開いたときの知らせ（画面を覆わない） */
  welcome?: ReactNode;
}

export default function TitleScreen({
  bestFloor,
  totalPlays,
  onStart,
  onShowStats,
  streak,
  lanterns,
  dailyNumber,
  todayDaily,
  onStartDaily,
  deepUnlocked,
  deepBest,
  onStartDeep,
  onShowCodex,
  bestOverall,
  welcome,
}: Props) {
  const title = currentTitle(bestOverall);
  return (
    <div className="flex min-h-full flex-col items-center justify-between gap-4 bg-arena px-6 py-10 [@media(max-height:700px)]:py-4">
      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 [@media(max-height:700px)]:gap-3">
        <div className="animate-float text-7xl [@media(max-height:700px)]:hidden drop-shadow-[0_8px_24px_rgba(16,185,129,0.4)]">
          ⛏️
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black leading-none tracking-tight">
            <span className="text-white">MINE</span>
            <span className="text-emerald-400"> ROGUE</span>
          </h1>
          <p className="mt-3 text-sm font-bold tracking-widest text-[#5B7799]">
            地雷の盤を潜るローグライク
          </p>
        </div>

        {/* Best record */}
        <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-[#0F1B2E] px-6 py-3">
          <span className="text-2xl">🏆</span>
          <div className="text-left">
            <p className="text-[10px] font-bold tracking-widest text-gray-500">
              ベスト記録
            </p>
            <p className="text-2xl font-black leading-tight text-yellow-400">
              B{bestFloor}F
            </p>
          </div>
        </div>
        {title && (
          <p className="text-xs font-black text-yellow-200/90">
            {title.icon} 称号「{title.name}」
          </p>
        )}
        {streak && streak.count > 0 && (
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="rounded-lg bg-[#16243A] px-2.5 py-1 text-orange-300">
              🔥 {streak.count}日連続
            </span>
            <span className="rounded-lg bg-[#16243A] px-2.5 py-1 text-sky-300">
              🎫 {streak.freezes}
            </span>
            {lanterns > 0 && (
              <span className="rounded-lg bg-[#16243A] px-2.5 py-1 text-amber-300">
                🔦 {lanterns}
              </span>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        {welcome}
        <button
          data-start
          onClick={onStart}
          className="animate-cta-pulse w-full rounded-2xl bg-[#10B981] py-5 [@media(max-height:700px)]:py-3 text-2xl font-black tracking-wide text-white transition-colors hover:bg-emerald-400 active:bg-emerald-600"
        >
          ゲームスタート
        </button>
        {todayDaily ? (
          <div className="w-full rounded-xl border border-sky-500/30 bg-[#0F1B2E] py-2.5 text-center text-sm font-bold text-sky-200">
            📅 デイリー #{dailyNumber} 記録 B{todayDaily.floor}F
            <span className="ml-1 text-[11px] font-normal text-gray-500">・また明日</span>
          </div>
        ) : (
          <button
            data-daily-start
            onClick={onStartDaily}
            className="w-full rounded-xl border border-sky-500/50 bg-[#10233D] py-3 text-base font-black text-sky-200 transition-colors hover:bg-[#15304F]"
          >
            📅 デイリー #{dailyNumber}
            <span className="ml-1.5 text-[11px] font-bold text-sky-400/80">
              全員同じ盤・1日1回
            </span>
          </button>
        )}
        {deepUnlocked ? (
          <button
            data-deep-start
            onClick={onStartDeep}
            className="w-full rounded-xl border border-orange-500/50 bg-[#2A1A10] py-3 text-base font-black text-orange-200 transition-colors hover:bg-[#3A2414]"
          >
            🌋 深層モード
            <span className="ml-1.5 text-[11px] font-bold text-orange-300/80">
              {deepBest > 0 ? `最深 B${deepBest}F` : "盤が広く・地雷が濃く"}
            </span>
          </button>
        ) : (
          <div className="w-full rounded-xl border border-[#1E3A5F] bg-[#0C1626] py-2.5 text-center text-xs font-bold text-gray-500">
            🔒 深層モード ・ B{DEEP_UNLOCK_FLOOR}F 到達で解放
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onShowCodex}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            📘 図鑑
          </button>
          <button
            onClick={onShowStats}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            📊 統計
          </button>
          {!IS_DIST && (
          <Link
            href="/how-to-play"
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-center text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            📖 遊び方
          </Link>
          )}
        </div>
        {totalPlays > 0 && (
          <p className="text-center text-[11px] text-gray-600">
            通算 {totalPlays}回プレイ
          </p>
        )}
        <AdUnit className="mt-1" />
      </div>
    </div>
  );
}
