"use client";

interface Props {
  step: number;
  total: number;
  title: string;
  text: string;
  onNext: () => void;
  onSkip: () => void;
  /** 画面のどこに出すか（inline は流れの中に置く） */
  position?: "top" | "bottom" | "inline";
}

/** 遊びながらの説明（盤の操作を邪魔しない吹き出し） */
export default function CoachTip({
  step,
  total,
  title,
  text,
  onNext,
  onSkip,
  position = "bottom",
}: Props) {
  const card = (
    <div
      data-coach
      className="pointer-events-auto w-full max-w-xs animate-slide-in-up rounded-2xl border border-emerald-400/60 bg-[#0B2A22]/95 p-3.5 shadow-2xl shadow-emerald-900/40"
      role="status"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black tracking-widest text-emerald-400">
          はじめての方へ {step}/{total}
        </p>
        <button onClick={onSkip} className="text-[10px] text-gray-400 underline">
          説明を閉じる
        </button>
      </div>
      <p className="mt-1 text-sm font-black text-white">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/90">{text}</p>
      <button
        data-coach-next
        onClick={onNext}
        className="mt-2 w-full rounded-lg bg-emerald-500/90 py-1.5 text-xs font-black text-white"
      >
        わかった
      </button>
    </div>
  );

  if (position === "inline") {
    return <div className="flex justify-center px-4 pt-4">{card}</div>;
  }
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 ${
        position === "top" ? "top-24" : "bottom-6"
      }`}
    >
      {card}
    </div>
  );
}
