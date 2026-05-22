"use client";
import { useState, useEffect, useRef } from "react";
import type { Skill } from "@/lib/types";

interface Props {
  skills: Skill[];
  onUseSkill: (skillId: string) => void;
  activeSkillId?: string;
}

function rarityBorderColor(rarity: 1 | 2 | 3): string {
  if (rarity === 1) return "#10B981";
  if (rarity === 2) return "#3B82F6";
  return "#A855F7";
}

export default function SkillBar({ skills, onUseSkill, activeSkillId }: Props) {
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipIdx === null) return;
    function handleOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setTooltipIdx(null);
      }
    }
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [tooltipIdx]);

  if (skills.length === 0) return null;

  const tooltipSkill = tooltipIdx !== null ? skills[tooltipIdx] : null;

  function handlePress(skill: Skill, idx: number) {
    if (skill.type === "active" && !skill.used) {
      setTooltipIdx(null);
      onUseSkill(skill.id);
    } else {
      setTooltipIdx((prev) => (prev === idx ? null : idx));
    }
  }

  return (
    <div
      ref={barRef}
      className="relative px-3 py-1.5 bg-[#0C1A2E] border-b border-[#1E3A5F]"
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-[#5B7799] tracking-widest shrink-0">
          SKILL
        </span>
        {skills.map((skill, i) => {
          const usable = skill.type === "active" && !skill.used;
          return (
            <button
              key={i}
              onClick={() => handlePress(skill, i)}
              className={`relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-transform
                ${skill.used ? "opacity-35 grayscale" : "active:scale-90"}
                ${activeSkillId === skill.id ? "ring-2 ring-white animate-ring-pulse" : ""}
              `}
              style={{
                borderColor: rarityBorderColor(skill.rarity),
                background: skill.used ? "#0F172A" : "#16243A",
              }}
              title={`${skill.name}: ${skill.description}`}
            >
              {skill.icon}
              {skill.used && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#0C1A2E] text-[8px] flex items-center justify-center text-gray-400 border border-[#334155]">
                  ✓
                </span>
              )}
              {usable && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0C1A2E]" />
              )}
            </button>
          );
        })}
      </div>
      {tooltipSkill && (
        <div
          className="absolute left-3 right-3 top-full mt-1 z-20 bg-[#16243A] border border-[#334155] rounded-xl p-3 shadow-2xl animate-slide-in-up"
          onClick={() => setTooltipIdx(null)}
        >
          <p className="text-sm font-bold text-white">
            {tooltipSkill.icon} {tooltipSkill.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            {tooltipSkill.description}
          </p>
          {tooltipSkill.used && (
            <p className="text-xs text-red-400 mt-1">使用済み</p>
          )}
          {tooltipSkill.type === "passive" && !tooltipSkill.used && (
            <p className="text-xs text-emerald-400 mt-1">パッシブ効果（常時発動）</p>
          )}
        </div>
      )}
    </div>
  );
}
