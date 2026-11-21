"use client";
import { lanternLadder, type VisitResult } from "@/lib/daily";
import { useI18n } from "@/i18n";

interface Props {
  visit: VisitResult;
  lanterns: number;
  onClose: () => void;
}

/**
 * その日はじめて開いたときの知らせ（ログイン報酬・連続の日数・おかえり）。
 * 画面を覆わない: タイトルの中に置くだけで、ゲームスタートはいつでも押せる。
 * もらえる物の段は先に全部見せる。
 */
export default function WelcomeModal({ visit, lanterns, onClose }: Props) {
  const { streak } = visit;
  const ladder = lanternLadder();
  const { t } = useI18n();
  return (
    <div
      data-welcome
      role="status"
      className="relative w-full max-w-xs animate-pop-in rounded-2xl border border-amber-400/40 bg-[#0F1B2E] px-4 py-3 text-center"
    >
      <button
        data-welcome-close
        onClick={onClose}
        aria-label={t.common.close}
        className="absolute right-2 top-1.5 px-2 text-sm text-gray-500 hover:text-gray-300"
      >
        ×
      </button>
      <p className="text-sm font-black text-white">
        {visit.welcomeBack ? t.welcome.back : t.welcome.today}
      </p>
      <p className="mt-1 text-xs text-gray-300">
        {t.welcome.lanterns} <span className="font-black text-amber-300">+{visit.lanterns}</span>
        <span className="text-gray-500">{t.welcome.lanternsNote(lanterns)}</span>
      </p>
      <div className="mt-2 flex justify-center gap-1.5 text-[10px] font-bold">
        {ladder.map((s) => {
          const here =
            streak.count >= s.fromDay && (s.toDay === null || streak.count <= s.toDay);
          return (
            <span
              key={s.fromDay}
              className={`rounded-md px-2 py-1 ${
                here ? "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/60" : "bg-[#16243A] text-gray-400"
              }`}
            >
              {s.toDay === null ? t.welcome.dayFrom(s.fromDay) : t.welcome.dayRange(s.fromDay, s.toDay)} 🔦{s.lanterns}
            </span>
          );
        })}
      </div>
      <p className="mt-1.5 text-[10px] text-gray-500">
        {t.welcome.streakLine(streak.count, streak.freezes)}
        {visit.freezesUsed > 0 && t.welcome.freezesUsed(visit.freezesUsed)}
      </p>
    </div>
  );
}
