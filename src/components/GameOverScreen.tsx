"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types";
import SkillCard from "./SkillCard";
import CrossPromo from "./CrossPromo";
import AdBanner from "./AdBanner";

interface Props {
  floor: number;
  skills: Skill[];
  timer: number;
  bestFloor: number;
  isNewRecord: boolean;
  revealedCount: number;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function GameOverScreen({
  floor,
  skills,
  timer,
  bestFloor,
  isNewRecord,
  revealedCount,
  onRestart,
}: Props) {
  const [copied, setCopied] = useState(false);

  const skillNames =
    skills.length > 0 ? skills.map((s) => s.name).join(", ") : "なし";
  const shareText = [
    "Mine Rogue ⛏",
    `到達: B${floor}F`,
    `スキル: ${skillNames}`,
    `⏱ ${formatTime(timer)}`,
    "",
    "https://mine-rogue.vercel.app/",
  ].join("\n");

  function handleShare() {
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleXShare() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-full flex flex-col bg-[#0A1628]">
      {/* Header with red overlay */}
      <div
        className="py-8 text-center"
        style={{
          background: "linear-gradient(180deg, #1A0A0A 0%, #0A1628 100%)",
        }}
      >
        <p className="text-6xl mb-3">💀</p>
        <h2 className="text-3xl font-black text-white tracking-[0.2em]">
          GAME OVER
        </h2>
        {isNewRecord && (
          <p className="text-yellow-400 font-bold mt-2 text-sm animate-pulse">
            🎉 New Record!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 pb-6">
        {/* Stats grid */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E3A5F] overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-[#1E3A5F]">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1.5">到達フロア</p>
              <p className="text-2xl font-black text-[#10B981]">B{floor}F</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1.5">経過時間</p>
              <p className="text-2xl font-black font-mono text-[#E2E8F0]">
                {formatTime(timer)}
              </p>
            </div>
          </div>
          <div className="border-t border-[#1E3A5F] grid grid-cols-2 divide-x divide-[#1E3A5F]">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1.5">開封セル数</p>
              <p className="text-2xl font-black text-[#E2E8F0]">
                {revealedCount}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1.5">ベスト記録</p>
              <p className="text-2xl font-black text-yellow-400">
                B{bestFloor}F
              </p>
            </div>
          </div>
        </div>

        {/* Acquired skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">取得スキル</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <SkillCard key={i} skill={skill} compact />
              ))}
            </div>
          </div>
        )}

        {/* Main CTA */}
        <button
          onClick={onRestart}
          className="w-full bg-[#10B981] hover:bg-emerald-400 active:bg-emerald-600 text-white font-black py-4 rounded-2xl text-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          もう一度
        </button>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#243350] border border-[#334155] text-[#E2E8F0] font-bold text-sm transition-colors"
          >
            {copied ? "コピーしました！" : "📋 結果をシェア"}
          </button>
          <button
            onClick={handleXShare}
            className="flex-1 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#243350] border border-[#334155] text-[#E2E8F0] font-bold text-sm transition-colors"
          >
            𝕏 でシェア
          </button>
        </div>

        <AdBanner />
        <CrossPromo />
      </div>
    </div>
  );
}
