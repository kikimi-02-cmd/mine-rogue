"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types";
import CrossPromo from "./CrossPromo";
import AdBanner from "./AdBanner";
import { trackEvent } from "@/lib/gtag";
import { formatTime, shareResult, saveResultCard } from "@/lib/share";
import skillsData from "@/data/skills.json";
import type { TitleDef, UnlockDef } from "@/lib/progress";

interface Props {
  floor: number;
  skills: Skill[];
  timer: number;
  bestFloor: number;
  isNewRecord: boolean;
  revealedCount: number;
  totalPlays: number;
  /** 毎日の挑戦なら「デイリー #N」 */
  dailyLabel?: string;
  isDaily?: boolean;
  newUnlocks?: UnlockDef[];
  newTitles?: TitleDef[];
  onRestart: () => void;
  onBackToTitle: () => void;
}

export default function GameOverScreen({
  floor,
  skills,
  timer,
  bestFloor,
  isNewRecord,
  revealedCount,
  totalPlays,
  dailyLabel,
  isDaily = false,
  newUnlocks = [],
  newTitles = [],
  onRestart,
  onBackToTitle,
}: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const result = { floor, skills, timer, isNewRecord, label: dailyLabel };

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  }

  async function handleShare() {
    const outcome = await shareResult(result);
    if (outcome === "shared" || outcome === "fallback") {
      trackEvent("share_card", { method: outcome, floor });
    }
    if (outcome === "fallback") flash("画像を保存し、文をコピーしました");
    if (outcome === "blocked") flash("共有できませんでした");
  }

  async function handleSave() {
    if (await saveResultCard(result)) {
      trackEvent("share_card", { method: "save", floor });
      flash("画像を保存しました");
    }
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
        {isDaily && dailyLabel && (
          <p className="mt-2 text-sm font-black text-sky-300">
            📅 {dailyLabel} の記録を残しました
          </p>
        )}
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

        {/* ラン同士で残るもの: 新しい称号・解放 */}
        {(newTitles.length > 0 || newUnlocks.length > 0) && (
          <div className="animate-pop-in rounded-2xl border border-yellow-500/40 bg-[#2A2410] p-3 text-center">
            {newTitles.map((t) => (
              <p key={t.floor} className="text-sm font-black text-yellow-200">
                {t.icon} 称号「{t.name}」を手に入れた！
              </p>
            ))}
            {newUnlocks.map((u) => {
              const meta = (skillsData as { id: string; name: string; icon: string }[]).find(
                (m) => m.id === u.skillId,
              );
              return (
                <p key={u.skillId} className="text-sm font-black text-emerald-300">
                  🔓 新スキル「{meta?.icon} {meta?.name}」が選択肢に入ります
                </p>
              );
            })}
          </div>
        )}

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

        {/* Share */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-[2] rounded-xl border border-emerald-500/50 bg-[#16243A] py-3 text-sm font-black text-emerald-300 transition-colors hover:bg-[#1E3350]"
            >
              📤 結果をシェア
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
            >
              🖼 画像を保存
            </button>
          </div>
          <p className="h-4 text-center text-xs text-emerald-400" aria-live="polite">
            {notice ?? ""}
          </p>
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
