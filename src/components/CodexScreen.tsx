"use client";
import { useMemo } from "react";
import skillsData from "@/data/skills.json";
import { loadSkillCounts } from "@/lib/storage";
import {
  TITLES,
  UNLOCKS,
  isUnlocked,
  nextTitle,
  type Progress,
} from "@/lib/progress";
import { useI18n, skillText } from "@/i18n";

interface Props {
  progress: Progress;
  onBack: () => void;
}

interface SkillMeta {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 1 | 2 | 3;
}

const STARS = ["", "★", "★★", "★★★"];

/** 図鑑: 取ったことのあるスキル・解放の条件・到達の節目の称号 */
export default function CodexScreen({ progress, onBack }: Props) {
  const counts = useMemo(() => loadSkillCounts(), []);
  const skills = skillsData as SkillMeta[];
  const seen = skills.filter((s) => (counts[s.id] ?? 0) > 0).length;
  const next = nextTitle(progress.best);
  const { t } = useI18n();

  return (
    <div className="min-h-full bg-arena px-4 pb-6 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#334155] bg-[#16243A] text-[#E2E8F0]"
          aria-label={t.common.back}
        >
          ←
        </button>
        <h2 className="text-xl font-black tracking-wide text-white">{t.codex.heading}</h2>
        <span className="ml-auto text-xs font-bold text-gray-400">
          {t.codex.skillCount(seen, skills.length)}
        </span>
      </div>

      {/* 称号 */}
      <div className="mb-4 rounded-2xl border border-yellow-500/30 bg-[#0F1B2E] p-4">
        <p className="mb-2 text-sm font-bold text-gray-400">{t.codex.titles}</p>
        <div className="grid grid-cols-3 gap-2">
          {TITLES.map((tt) => {
            const got = progress.best >= tt.floor;
            return (
              <div
                key={tt.floor}
                className={`rounded-xl border p-2 text-center ${
                  got
                    ? "border-yellow-500/50 bg-[#2A2410]"
                    : "border-[#1E3A5F] bg-[#0C1626] opacity-60"
                }`}
              >
                <p className="text-xl">{got ? tt.icon : "🔒"}</p>
                <p className="mt-0.5 text-[10px] font-black leading-tight text-[#E2E8F0]">
                  {got ? (t.titles[tt.floor] ?? tt.name) : t.codex.unknown}
                </p>
                <p className="text-[9px] text-gray-500">B{tt.floor}F</p>
              </div>
            );
          })}
        </div>
        {next && (
          <p className="mt-2 text-center text-[11px] text-gray-500">
            {t.codex.nextTitle(next.floor, progress.best)}
          </p>
        )}
      </div>

      {/* スキル */}
      <div className="rounded-2xl border border-[#1E3A5F] bg-[#0F1B2E] p-4">
        <p className="mb-2 text-sm font-bold text-gray-400">{t.codex.skills}</p>
        <div className="flex flex-col gap-2">
          {skills.map((s) => {
            const unlock = UNLOCKS.find((u) => u.skillId === s.id);
            const locked = unlock ? !isUnlocked(unlock, progress) : false;
            const n = counts[s.id] ?? 0;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 rounded-xl border border-[#1E3A5F] px-3 py-2 ${
                  locked ? "bg-[#0C1626] opacity-60" : "bg-[#16243A]"
                }`}
              >
                <span className="w-7 text-center text-xl">
                  {locked ? "🔒" : n > 0 ? s.icon : "❔"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-[#E2E8F0]">
                    {locked ? t.codex.unknown : skillText(t, s).name}
                    <span className="ml-1.5 text-[10px] text-yellow-400">
                      {STARS[s.rarity]}
                    </span>
                  </p>
                  <p className="text-[10px] leading-snug text-gray-400">
                    {locked ? t.codex.unlock(t.unlocks[unlock!.skillId] ?? unlock!.label) : skillText(t, s).description}
                  </p>
                </div>
                {!locked && (
                  <span className="shrink-0 font-mono text-[10px] text-gray-500">
                    {n > 0 ? `×${n}` : t.codex.notYet}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-5 w-full rounded-2xl bg-[#10B981] py-4 text-lg font-black text-white"
      >
        {t.common.backToTitle}
      </button>
    </div>
  );
}
