'use client';

import { useState } from 'react';
import type { Skill } from '@/lib/types';
import SkillCard from './SkillCard';
import CrossPromo from './CrossPromo';
import AdBanner from './AdBanner';

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
  const [copied, setCopied] = useState(false);

  const skillNames = skills.length > 0 ? skills.map((s) => s.name).join(', ') : 'なし';
  const shareText = [
    'Mine Rogue ⛏',
    `到達: ${floor}フロア`,
    `スキル: ${skillNames}`,
    `⏱ ${formatTime(timer)}`,
    '',
    'https://mine-rogue.vercel.app/',
  ].join('\n');

  function handleShare() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {/* ignore */});
  }

  function handleXShare() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

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

      {/* シェアボタン */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
        >
          {copied ? 'コピーしました！' : '結果をシェア'}
        </button>
        <button
          onClick={handleXShare}
          className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-600 text-white font-bold text-sm transition-colors"
        >
          𝕏 でシェア
        </button>
      </div>

      <AdBanner />

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
