"use client";
import { useMemo } from "react";
import skillsData from "@/data/skills.json";
import {
  loadBestFloor,
  loadPlayCount,
  loadTotalRevealed,
  loadSkillCounts,
} from "@/lib/storage";
import CrossPromo from "./CrossPromo";
import AdBanner from "./AdBanner";

interface Props {
  onBack: () => void;
}

export default function StatsScreen({ onBack }: Props) {
  const { bestFloor, plays, revealed, topSkills } = useMemo(() => {
    const counts = loadSkillCounts();
    const meta = skillsData as { id: string; name: string; icon: string }[];
    const stats = meta
      .map((m) => ({ ...m, count: counts[m.id] ?? 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return {
      bestFloor: loadBestFloor(),
      plays: loadPlayCount(),
      revealed: loadTotalRevealed(),
      topSkills: stats,
    };
  }, []);

  const maxCount = topSkills.length > 0 ? topSkills[0].count : 1;

  return (
    <div className="min-h-full bg-arena px-4 pb-6 pt-4">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#334155] bg-[#16243A] text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          aria-label="戻る"
        >
          ←
        </button>
        <h2 className="text-xl font-black tracking-wide text-white">📊 統計</h2>
      </div>

      {/* Best floor highlight */}
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-yellow-500/30 bg-[#0F1B2E] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <span className="text-sm font-bold text-gray-400">ベスト到達</span>
        </div>
        <span className="text-3xl font-black text-yellow-400">B{bestFloor}F</span>
      </div>

      {/* Stat grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#1E3A5F] bg-[#0F1B2E] p-4 text-center">
          <p className="mb-1 text-2xl">🎮</p>
          <p className="text-2xl font-black text-emerald-400">{plays}</p>
          <p className="mt-0.5 text-xs text-gray-500">通算プレイ回数</p>
        </div>
        <div className="rounded-2xl border border-[#1E3A5F] bg-[#0F1B2E] p-4 text-center">
          <p className="mb-1 text-2xl">⛏️</p>
          <p className="text-2xl font-black text-[#E2E8F0]">{revealed}</p>
          <p className="mt-0.5 text-xs text-gray-500">通算開封セル数</p>
        </div>
      </div>

      {/* Top skills */}
      <div className="rounded-2xl border border-[#1E3A5F] bg-[#0F1B2E] p-4">
        <p className="mb-3 text-sm font-bold text-gray-400">よく取ったスキル</p>
        {topSkills.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-600">
            まだデータがありません。プレイして記録を残そう！
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {topSkills.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <span className="w-6 text-center text-lg">{s.icon}</span>
                <span className="w-20 shrink-0 truncate text-xs font-bold text-[#E2E8F0]">
                  {s.name}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#16243A]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-bold text-gray-400">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="mt-5 w-full rounded-2xl bg-[#10B981] py-4 text-lg font-black text-white transition-colors hover:bg-emerald-400 active:bg-emerald-600"
      >
        タイトルへ戻る
      </button>

      <div className="mt-4">
        <AdBanner />
      </div>
      <CrossPromo />
    </div>
  );
}
