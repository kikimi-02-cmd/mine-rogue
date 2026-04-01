import type { Skill } from "@/lib/types";
import { rarityColor, rarityLabel } from "@/lib/skills";

interface Props {
  skill: Skill;
  onClick?: () => void;
  compact?: boolean;
}

export default function SkillCard({ skill, onClick, compact }: Props) {
  const colors = rarityColor(skill.rarity);
  const label = rarityLabel(skill.rarity);

  if (compact) {
    return (
      <div
        className={`border rounded px-2 py-1 text-xs font-bold cursor-pointer ${colors} ${skill.used ? "opacity-40" : "hover:opacity-80"}`}
        onClick={onClick}
        title={skill.description}
      >
        {skill.icon} {skill.name}
      </div>
    );
  }

  return (
    <div
      className={`border-2 rounded-xl p-4 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${colors} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-2xl leading-none">{skill.icon}</span>
        <div>
          <div className="text-yellow-400 text-xs">{label}</div>
          <div className="text-white font-bold text-base">{skill.name}</div>
        </div>
      </div>
      <div className="text-gray-300 text-xs leading-relaxed">
        {skill.description}
      </div>
    </div>
  );
}
