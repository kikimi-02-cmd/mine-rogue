interface Props {
  floor: number;
  mineCount: number;
  flagCount: number;
  timer: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Header({ floor, mineCount, flagCount, timer }: Props) {
  const remaining = mineCount - flagCount;
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-[#0F172A] border-b border-[#1E3A5F]">
      <div className="w-16">
        <span className="text-[#10B981] font-black text-xl tracking-wide">
          B{floor}F
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg leading-none">💣</span>
        <span className="text-[#E2E8F0] font-black text-base">
          ×{remaining}
        </span>
      </div>
      <div className="w-16 flex justify-end items-center gap-1">
        <span className="text-gray-500 text-xs">⏱</span>
        <span className="font-mono text-[#E2E8F0] text-sm font-semibold tracking-wider">
          {formatTime(timer)}
        </span>
      </div>
    </div>
  );
}
