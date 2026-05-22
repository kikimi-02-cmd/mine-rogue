"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types";
import CrossPromo from "./CrossPromo";
import AdBanner from "./AdBanner";

interface Props {
  floor: number;
  skills: Skill[];
  timer: number;
  bestFloor: number;
  isNewRecord: boolean;
  revealedCount: number;
  totalPlays: number;
  onRestart: () => void;
  onBackToTitle: () => void;
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
  totalPlays,
  onRestart,
  onBackToTitle,
}: Props) {
  const [copied, setCopied] = useState(false);

  const skillIcons =
    skills.length > 0 ? skills.map((s) => s.icon).join("") : "なし";
  const shareText = [
    "Mine Rogue ⛏💀",
    `到達: B${floor}F`,
    `スキル: ${skillIcons}`,
    `⏱ ${formatTime(timer)}`,
    "#MineRogue #ブラウザゲーム",
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
    <div className="min-h-full flex flex-col bg-arena">
      {/* Header with red overlay */}
      <div
        className="py-8 text-center"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% 0%, rgba(127,29,29,0.55), transparent 70%)",
        }}
      >
        <p className="text-6xl mb-3 animate-pop-in">💀</p>
        <h2 className="text-3xl font-black text-white tracking-[0.2em]">
          GAME OVER
        </h2>
        {isNewRecord && (
          <p className="mt-2 text-base font-black tracking-widest text-yellow-400 animate-record-glow">
            🎉 NEW RECORD!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 pb-6">
        {/* Stats grid */}
        <div className="overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#0F1B2E]">
          <div className="grid grid-cols-2 divide-x divide-[#1E3A5F]">
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">到達フロア</p>
              <p className="text-2xl font-black text-emerald-400">B{floor}F</p>
            </div>
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">経過時間</p>
              <p className="font-mono text-2xl font-black text-[#E2E8F0]">
                {formatTime(timer)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-[#1E3A5F] border-t border-[#1E3A5F]">
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">開封セル数</p>
              <p className="text-2xl font-black text-[#E2E8F0]">
                {revealedCount}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">ベスト記録</p>
              <p className="text-2xl font-black text-yellow-400">B{bestFloor}F</p>
            </div>
          </div>
        </div>

        {/* Acquired skills */}
        {skills.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-gray-500">取得スキル</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-[#334155] bg-[#16243A] px-2.5 py-1.5"
                >
                  <span className="text-base leading-none">{skill.icon}</span>
                  <span className="text-xs font-bold text-[#E2E8F0]">
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onRestart}
            className="w-full rounded-2xl bg-[#10B981] py-5 text-2xl font-black text-white shadow-xl shadow-emerald-500/30 transition-colors hover:bg-emerald-400 active:bg-emerald-600"
            style={{ letterSpacing: "0.05em" }}
          >
            もう一度
          </button>
          <p className="text-xs text-gray-500">
            次こそB{bestFloor + 1}Fを目指そう！
          </p>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-2.5 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            {copied ? "コピーしました！" : "📋 結果をシェア"}
          </button>
          <button
            onClick={handleXShare}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-2.5 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            𝕏 でシェア
          </button>
        </div>

        <button
          onClick={onBackToTitle}
          className="self-center text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          🏠 タイトルへ戻る
        </button>

        {totalPlays > 0 && (
          <p className="text-center text-xs text-gray-600">
            通算 {totalPlays}回プレイ
          </p>
        )}
        <AdBanner />
        <CrossPromo />
      </div>
    </div>
  );
}
