interface Props {
  floor: number;
  mineCount: number;
  flagCount: number;
  timer: number;
  progress: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Header({
  floor,
  mineCount,
  flagCount,
  timer,
  progress,
}: Props) {
  const remaining = mineCount - flagCount;
  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const remainColor =
    remaining < 0
      ? "text-red-400"
      : remaining === 0
        ? "text-emerald-400"
        : "text-[#E2E8F0]";

  return (
    <header className="bg-[#0C1A2E] border-b border-[#1E3A5F]">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center rounded-lg bg-[#15233A] px-3 py-1.5 min-w-[80px]">
          <span className="text-emerald-400 font-black text-lg leading-none tracking-wide">
            B{floor}F
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-[#15233A] px-3 py-1.5">
          <span className="text-base leading-none">💣</span>
          <span className={`font-black text-base leading-none ${remainColor}`}>
            {remaining}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5 rounded-lg bg-[#15233A] px-3 py-1.5 min-w-[80px]">
          <span className="text-xs leading-none">⏱</span>
          <span className="font-mono text-[#E2E8F0] text-sm font-bold tracking-wider leading-none">
            {formatTime(timer)}
          </span>
        </div>
      </div>
      <div className="h-1 bg-[#0A1628]">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}
