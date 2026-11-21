"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types";
import CrossPromo from "./CrossPromo";
import AdBanner from "./AdBanner";
import { trackEvent } from "@/lib/gtag";
import { EVENTS, bucketFloor } from "@/lib/events";
import { formatTime, shareResult, saveResultCard } from "@/lib/share";
import skillsData from "@/data/skills.json";
import type { TitleDef, UnlockDef } from "@/lib/progress";
import { useI18n, skillText } from "@/i18n";

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
  /** 毎日の挑戦のお題の日付 */
  dateKey?: string | null;
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
  dateKey = null,
  newUnlocks = [],
  newTitles = [],
  onRestart,
  onBackToTitle,
}: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const { t, lang } = useI18n();
  const result = {
    floor,
    skills,
    timer,
    isNewRecord,
    label: dailyLabel,
    dateKey,
    lang,
  };

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  }

  /** うれしい瞬間（自己ベスト・新しい称号や解放・毎日の挑戦の記録）があったか */
  const happy = isNewRecord || newTitles.length > 0 || newUnlocks.length > 0 || isDaily;

  async function handleShare() {
    const place = happy ? "top" : "bottom";
    trackEvent(EVENTS.shareStart, { place, floor_bucket: bucketFloor(floor) });
    const outcome = await shareResult(result);
    trackEvent(EVENTS.shareDone, { place, outcome, floor_bucket: bucketFloor(floor) });
    if (outcome === "shared" || outcome === "fallback") {
      trackEvent(EVENTS.shareCard, { method: outcome, floor_bucket: bucketFloor(floor) });
    }
    if (outcome === "fallback") flash(t.gameOver.sharedFallback);
    if (outcome === "blocked") flash(t.gameOver.shareBlocked);
  }

  async function handleSave() {
    trackEvent(EVENTS.shareStart, { place: "save", floor_bucket: bucketFloor(floor) });
    if (await saveResultCard(result)) {
      trackEvent(EVENTS.shareDone, { place: "save", outcome: "save", floor_bucket: bucketFloor(floor) });
      trackEvent(EVENTS.shareCard, { method: "save", floor_bucket: bucketFloor(floor) });
      flash(t.gameOver.saved);
    }
  }

  const shareBlock = (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-[2] rounded-xl border border-emerald-500/50 bg-[#16243A] py-3 text-sm font-black text-emerald-300 transition-colors hover:bg-[#1E3350]"
            >
              {t.gameOver.share}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
            >
              {t.gameOver.save}
            </button>
          </div>
          <p className="h-4 text-center text-xs text-emerald-400" aria-live="polite">
            {notice ?? ""}
          </p>
        </div>
  );

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
            {t.gameOver.dailyLogged(dailyLabel)}
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
              <p className="mb-1.5 text-xs text-gray-500">{t.gameOver.reached}</p>
              <p className="text-2xl font-black text-emerald-400">B{floor}F</p>
            </div>
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">{t.gameOver.time}</p>
              <p className="font-mono text-2xl font-black text-[#E2E8F0]">
                {formatTime(timer)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-[#1E3A5F] border-t border-[#1E3A5F]">
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">{t.gameOver.opened}</p>
              <p className="text-2xl font-black text-[#E2E8F0]">
                {revealedCount}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="mb-1.5 text-xs text-gray-500">{t.gameOver.best}</p>
              <p className="text-2xl font-black text-yellow-400">B{bestFloor}F</p>
            </div>
          </div>
        </div>

        {/* ラン同士で残るもの: 新しい称号・解放 */}
        {(newTitles.length > 0 || newUnlocks.length > 0) && (
          <div className="animate-pop-in rounded-2xl border border-yellow-500/40 bg-[#2A2410] p-3 text-center">
            {newTitles.map((tt) => (
              <p key={tt.floor} className="text-sm font-black text-yellow-200">
                {t.gameOver.newTitle(tt.icon, t.titles[tt.floor] ?? tt.name)}
              </p>
            ))}
            {newUnlocks.map((u) => {
              const meta = (skillsData as { id: string; name: string; icon: string }[]).find(
                (m) => m.id === u.skillId,
              );
              return (
                <p key={u.skillId} className="text-sm font-black text-emerald-300">
                  {t.gameOver.newUnlock(meta?.icon ?? "", meta ? skillText(t, meta).name : "")}
                </p>
              );
            })}
          </div>
        )}

        {/* うれしい瞬間の直後に共有の入口 */}
        {happy && shareBlock}

        {/* Acquired skills */}
        {skills.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-gray-500">{t.gameOver.skillsTaken}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-[#334155] bg-[#16243A] px-2.5 py-1.5"
                >
                  <span className="text-base leading-none">{skill.icon}</span>
                  <span className="text-xs font-bold text-[#E2E8F0]">
                    {skillText(t, skill).name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-2">
          <button
            data-again
            onClick={onRestart}
            className="w-full rounded-2xl bg-[#10B981] py-5 text-2xl font-black text-white shadow-xl shadow-emerald-500/30 transition-colors hover:bg-emerald-400 active:bg-emerald-600"
            style={{ letterSpacing: "0.05em" }}
          >
            {t.gameOver.again}
          </button>
          <p className="text-xs text-gray-500">
            {t.gameOver.aimNext(bestFloor + 1)}
          </p>
        </div>

        {!happy && shareBlock}

        <button
          data-back-title
          onClick={onBackToTitle}
          className="self-center text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          {t.common.backToTitleHome}
        </button>

        <p data-ok-to-stop className="text-center text-[11px] text-gray-500">
          {t.gameOver.okToStop}
        </p>

        {totalPlays > 0 && (
          <p className="text-center text-xs text-gray-600">
            {t.common.totalPlays(totalPlays)}
          </p>
        )}
        <AdBanner />
        <CrossPromo />
      </div>
    </div>
  );
}
