import type { Skill } from '@/lib/types';
import SkillCard from './SkillCard';
import CrossPromo from './CrossPromo';

interface Props {
  floor: number;
  skills: Skill[];
  timer: number;
  bestFloor: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function GameOverScreen({ floor, skills, timer, bestFloor, isNewRecord, onRestart }: Props) {
  return (
    <div className="flex flex-col gap-4 py-8 px-4">
      <div className="text-center">
        <p className="text-5xl mb-2">💀</p>
        <h2 className="text-3xl font-black text-white">Game Over</h2>
        {isNewRecord && (
          <p className="text-yellow-400 font-bold mt-1">🎉 New Record!</p>
        )}
      </div>

      <div className="bg-[#1F2937] rounded-2xl p-4 text-sm space-y-2">
        <div className="flex justify-between text-gray-300">
          <span>到達フロア</span>
          <span className="font-bold text-white">{floor}F</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>経過時間</span>
          <span className="font-bold text-white">{formatTime(timer)}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>ベスト</span>
          <span className="font-bold text-yellow-400">{bestFloor}F</span>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">獲得したスキル</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <SkillCard key={i} skill={skill} compact />
            ))}
          </div>
        </div>
      )}

      {/* 広告プレースホルダー */}
      <div className="w-full h-16 bg-gray-800 border border-dashed border-gray-600 rounded-xl flex items-center justify-center">
        <span className="text-xs text-gray-600">広告枠</span>
      </div>

      <button
        onClick={onRestart}
        className="w-full bg-gray-600 hover:bg-gray-500 text-white font-black py-3 rounded-2xl text-lg transition-colors"
      >
        もう一度
      </button>

      <CrossPromo />
    </div>
  );
}
