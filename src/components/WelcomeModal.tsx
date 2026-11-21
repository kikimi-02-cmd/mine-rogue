"use client";
import type { VisitResult } from "@/lib/daily";

interface Props {
  visit: VisitResult;
  lanterns: number;
  onClose: () => void;
}

/** その日はじめて開いたときの小さな知らせ（ログイン報酬・連続の日数・おかえり） */
export default function WelcomeModal({ visit, lanterns, onClose }: Props) {
  const { streak } = visit;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xs animate-pop-in rounded-2xl border border-amber-400/40 bg-[#0F1B2E] p-5 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-4xl">{visit.welcomeBack ? "👋" : "🔦"}</p>
        <h2 className="mt-2 text-lg font-black text-white">
          {visit.welcomeBack ? "おかえりなさい！" : "今日のログインボーナス"}
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          灯り <span className="font-black text-amber-300">+{visit.lanterns}</span>
          <span className="text-gray-500">（手持ち {lanterns}）</span>
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
          次のランの最初のフロアで、安全なマスを 1 つずつ開けられます
        </p>
        <div className="mt-4 flex justify-center gap-2 text-xs">
          <span className="rounded-lg bg-[#16243A] px-3 py-1.5 font-bold text-orange-300">
            🔥 {streak.count}日連続
          </span>
          <span className="rounded-lg bg-[#16243A] px-3 py-1.5 font-bold text-sky-300">
            🎫 お休み券 {streak.freezes}
          </span>
        </div>
        {visit.freezesUsed > 0 && (
          <p className="mt-2 text-[11px] text-sky-300">
            お休み券を {visit.freezesUsed} 枚使って連続をつなぎました
          </p>
        )}
        <p className="mt-2 text-[10px] text-gray-600">
          連続が続くと灯りが増えます（最大 3）。お休み券は毎週 1 枚自動で届きます
        </p>
        <button
          data-welcome-close
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-[#10B981] py-3 font-black text-white"
        >
          受け取る
        </button>
      </div>
    </div>
  );
}
