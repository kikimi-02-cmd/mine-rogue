import type { Skill } from '@/lib/types';
import SkillCard from './SkillCard';

interface Props {
  skills: Skill[];
  onUseSkill: (skillId: string) => void;
  activeSkillId?: string;
}

export default function SkillBar({ skills, onUseSkill, activeSkillId }: Props) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 px-2 py-1">
      {skills.map((skill) => (
        <div
          key={skill.id + skill.used}
          className={`${activeSkillId === skill.id ? 'ring-2 ring-white rounded' : ''}`}
        >
          <SkillCard
            skill={skill}
            compact
            onClick={skill.type === 'active' && !skill.used ? () => onUseSkill(skill.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
