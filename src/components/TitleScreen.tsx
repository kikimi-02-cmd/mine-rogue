"use client";
import Link from "next/link";

interface Props {
  bestFloor: number;
  totalPlays: number;
  onStart: () => void;
  onShowStats: () => void;
}

export default function TitleScreen({
  bestFloor,
  totalPlays,
  onStart,
  onShowStats,
}: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-between bg-arena px-6 py-10">
      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="animate-float text-7xl drop-shadow-[0_8px_24px_rgba(16,185,129,0.4)]">
          ⛏️
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black leading-none tracking-tight">
            <span className="text-white">MINE</span>
            <span className="text-emerald-400"> ROGUE</span>
          </h1>
          <p className="mt-3 text-sm font-bold tracking-widest text-[#5B7799]">
            マインスイーパー × ローグライク
          </p>
        </div>

        {/* Best record */}
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
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={onStart}
          className="animate-cta-pulse w-full rounded-2xl bg-[#10B981] py-5 text-2xl font-black tracking-wide text-white transition-colors hover:bg-emerald-400 active:bg-emerald-600"
        >
          ゲームスタート
        </button>
        <div className="flex gap-3">
          <button
            onClick={onShowStats}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            📊 統計
          </button>
          <Link
            href="/how-to-play"
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-center text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            📖 遊び方
          </Link>
        </div>
        {totalPlays > 0 && (
          <p className="text-center text-[11px] text-gray-600">
            通算 {totalPlays}回プレイ
          </p>
        )}
      </div>
    </div>
  );
}
