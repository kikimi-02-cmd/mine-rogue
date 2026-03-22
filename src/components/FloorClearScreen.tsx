interface Props {
  floor: number;
  timer: number;
  onContinue: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FloorClearScreen({ floor, timer, onContinue }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
      <p className="text-5xl">✨</p>
      <div>
        <h2 className="text-3xl font-black text-white">{floor}F Clear!</h2>
        <p className="text-gray-400 mt-1">クリアタイム: {formatTime(timer)}</p>
      </div>
      <button
        onClick={onContinue}
        className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-3 rounded-2xl text-lg transition-colors"
      >
        スキルを選ぶ →
      </button>
    </div>
  );
}
