"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import AdUnit from "@/components/AdUnit";
import LangToggle from "@/components/LangToggle";
import type { StreakState } from "@/lib/daily";
import type { DailyRecord } from "@/lib/storage";
import { currentTitle, DEEP_UNLOCK_FLOOR } from "@/lib/progress";
import { IS_DIST } from "@/lib/dist";
import { useI18n, localePath } from "@/i18n";

interface Props {
  /** 逃した日のお題（後から 1 回ずつ遊べる） */
  pastDailies?: { key: string; number: number }[];
  onStartDailyFor?: (dateKey: string) => void;
  /** 招待のリンクで来たお題 */
  invite?: { key: string; number: number; record: DailyRecord | null } | null;
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
  pastDailies = [],
  onStartDailyFor,
  invite = null,
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
  const { t, lang } = useI18n();
  return (
    <div className="relative flex min-h-full flex-col items-center justify-between gap-4 bg-arena px-6 pb-10 pt-3 [@media(max-height:700px)]:py-4">
      {/* 言葉の切り替え: 高い画面はロゴの上の行、低い画面（960×540 など）は右上の隅に重ねる */}
      <div className="flex w-full justify-end [@media(max-height:700px)]:absolute [@media(max-height:700px)]:right-2 [@media(max-height:700px)]:top-2 [@media(max-height:700px)]:w-auto">
        <LangToggle />
      </div>
      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 [@media(max-height:700px)]:gap-3">
        <div className="animate-float text-7xl [@media(max-height:700px)]:hidden drop-shadow-[0_8px_24px_rgba(16,185,129,0.4)]">
          ⛏️
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black leading-none tracking-tight [@media(max-height:700px)]:text-4xl">
            <span className="text-white">MINE</span>
            <span className="text-emerald-400"> ROGUE</span>
          </h1>
          <p
            className={`mt-3 text-sm font-bold text-[#5B7799] ${lang === "ja" ? "tracking-widest" : "tracking-wider whitespace-nowrap text-[13px]"}`}
          >
            {t.title.tagline}
          </p>
        </div>

        {/* Best record */}
        <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-[#0F1B2E] px-6 py-3">
          <span className="text-2xl">🏆</span>
          <div className="text-left">
            <p className="text-[10px] font-bold tracking-widest text-gray-500">
              {t.title.best}
            </p>
            <p className="text-2xl font-black leading-tight text-yellow-400">
              B{bestFloor}F
            </p>
          </div>
        </div>
        {title && (
          <p className="text-xs font-black text-yellow-200/90">
            {t.title.titleBadge(title.icon, t.titles[title.floor] ?? title.name)}
          </p>
        )}
        {streak && streak.count > 0 && (
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="rounded-lg bg-[#16243A] px-2.5 py-1 text-orange-300">
              {t.title.streakDays(streak.count)}
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
          {t.title.start}
        </button>
        {invite && (
          invite.record ? (
            <div className="w-full rounded-xl border border-fuchsia-400/40 bg-[#1E1030] py-2.5 text-center text-sm font-bold text-fuchsia-200">
              {t.title.inviteDone(invite.number, invite.record.floor)}
            </div>
          ) : (
            <button
              data-invite-start
              onClick={() => onStartDailyFor?.(invite.key)}
              className="w-full rounded-xl border border-fuchsia-400/60 bg-[#1E1030] py-3 text-base font-black text-fuchsia-200 transition-colors hover:bg-[#2A1640]"
            >
              {t.title.invite(invite.number)}
              <span className="ml-1.5 text-[11px] font-bold text-fuchsia-300/80">
                {t.title.inviteSub}
              </span>
            </button>
          )
        )}
        {todayDaily ? (
          <div className="w-full rounded-xl border border-sky-500/30 bg-[#0F1B2E] py-2.5 text-center text-sm font-bold text-sky-200">
            {t.title.dailyDone(dailyNumber, todayDaily.floor)}
            <span className="ml-1 text-[11px] font-normal text-gray-500">{t.title.seeTomorrow}</span>
          </div>
        ) : (
          <button
            data-daily-start
            onClick={onStartDaily}
            className="w-full rounded-xl border border-sky-500/50 bg-[#10233D] py-3 text-base font-black text-sky-200 transition-colors hover:bg-[#15304F]"
          >
            {t.title.daily(dailyNumber)}
            <span className="ml-1.5 text-[11px] font-bold text-sky-400/80">
              {t.title.dailySub}
            </span>
          </button>
        )}
        {pastDailies.length > 0 && (
          <div data-past-dailies className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500">{t.title.missed}</span>
            {pastDailies.map((d) => (
              <button
                key={d.key}
                onClick={() => onStartDailyFor?.(d.key)}
                className="rounded-lg border border-sky-500/30 bg-[#0F1B2E] px-2.5 py-1 text-[11px] font-black text-sky-300 hover:bg-[#15304F]"
              >
                #{d.number}
              </button>
            ))}
          </div>
        )}
        {deepUnlocked ? (
          <button
            data-deep-start
            onClick={onStartDeep}
            className="w-full rounded-xl border border-orange-500/50 bg-[#2A1A10] py-3 text-base font-black text-orange-200 transition-colors hover:bg-[#3A2414]"
          >
            {t.title.deep}
            <span className="ml-1.5 text-[11px] font-bold text-orange-300/80">
              {deepBest > 0 ? t.title.deepBest(deepBest) : t.title.deepSub}
            </span>
          </button>
        ) : (
          <div className="w-full rounded-xl border border-[#1E3A5F] bg-[#0C1626] py-2.5 text-center text-xs font-bold text-gray-500">
            {t.title.deepLocked(DEEP_UNLOCK_FLOOR)}
          </div>
        )}
        <div className="flex gap-3">
          <button
            data-codex
            onClick={onShowCodex}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            {t.title.codex}
          </button>
          <button
            data-stats
            onClick={onShowStats}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            {t.title.stats}
          </button>
          {!IS_DIST && (
          <Link
            href={localePath(lang, "/how-to-play")}
            className="flex-1 rounded-xl border border-[#334155] bg-[#16243A] py-3 text-center text-sm font-bold text-[#E2E8F0] transition-colors hover:bg-[#1E3350]"
          >
            {t.title.howTo}
          </Link>
          )}
        </div>
        {totalPlays > 0 && (
          <p className="text-center text-[11px] text-gray-600">
            {t.common.totalPlays(totalPlays)}
          </p>
        )}
        <AdUnit className="mt-1" />
      </div>
    </div>
  );
}
