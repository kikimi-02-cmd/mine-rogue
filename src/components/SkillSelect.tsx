import type { Skill } from "@/lib/types";
import SkillCard from "./SkillCard";
import { useI18n } from "@/i18n";

interface Props {
  choices: Skill[];
  onSelect: (skill: Skill) => void;
  floor: number;
}

export default function SkillSelect({ choices, onSelect, floor }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 bg-arena px-5 py-8">
      <div className="text-center animate-pop-in">
        <p className="text-5xl mb-2">✨</p>
        <h2 className="text-2xl font-black text-white tracking-wide">
          B{floor}F <span className="text-emerald-400">{t.floorClear.cleared}</span>
        </h2>
        <p className="mt-1.5 text-sm text-gray-400">
          {t.floorClear.pick}
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {choices.map((skill, i) => (
          <div
            key={skill.id}
            className="animate-card-enter"
            style={{ animationDelay: `${0.07 + i * 0.08}s` }}
          >
            <SkillCard skill={skill} onClick={() => onSelect(skill)} />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-600">
        {t.floorClear.note}
      </p>
    </div>
  );
}
