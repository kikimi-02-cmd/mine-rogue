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
      className="relative px-3 py-1.5 bg-[#0A1628] border-b border-[#1E3A5F]"
    >
      <div className="flex gap-1.5 overflow-x-auto">
        {skills.map((skill, i) => (
          <button
            key={i}
            onClick={() => handlePress(skill, i)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base border-2 transition-all
              ${skill.used ? "opacity-30" : "active:scale-90"}
              ${activeSkillId === skill.id ? "ring-2 ring-white ring-offset-1 ring-offset-[#0A1628]" : ""}
            `}
            style={{
              borderColor: rarityBorderColor(skill.rarity),
              background: skill.used ? "#0F172A" : "#1E293B",
            }}
            title={`${skill.name}: ${skill.description}`}
          >
            {skill.icon}
          </button>
        ))}
      </div>
      {tooltipSkill && (
        <div
          className="absolute left-3 right-3 top-full mt-1 z-20 bg-[#1E2D45] border border-[#334155] rounded-xl p-3 shadow-2xl"
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
            <p className="text-xs text-emerald-400 mt-1">パッシブ効果</p>
          )}
        </div>
      )}
    </div>
  );
}
