interface Props {
  floor: number;
  mineCount: number;
  flagCount: number;
  timer: number;
  bestFloor: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Header({ floor, mineCount, flagCount, timer, bestFloor }: Props) {
  const remaining = mineCount - flagCount;
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#1F2937] border-b border-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-white font-black text-lg">⛏ Mine Rogue</span>
        <span className="text-yellow-400 font-bold text-sm">{floor}F</span>
        <span className="text-red-400 text-sm">💣{remaining}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>🏆{bestFloor}F</span>
        <span>⏱{formatTime(timer)}</span>
      </div>
    </div>
  );
}
