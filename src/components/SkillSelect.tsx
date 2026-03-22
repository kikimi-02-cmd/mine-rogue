import type { Skill } from '@/lib/types';
import SkillCard from './SkillCard';
import AdBanner from './AdBanner';

interface Props {
  choices: Skill[];
  onSelect: (skill: Skill) => void;
  floor: number;
}

export default function SkillSelect({ choices, onSelect, floor }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <div className="text-center">
        <p className="text-4xl mb-2">✨</p>
        <h2 className="text-2xl font-black text-white">{floor}F クリア！</h2>
        <p className="text-gray-400 text-sm mt-1">スキルを1つ選んでください</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {choices.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onClick={() => onSelect(skill)} />
        ))}
      </div>
      <div className="w-full max-w-xs">
        <AdBanner />
      </div>
    </div>
  );
}
