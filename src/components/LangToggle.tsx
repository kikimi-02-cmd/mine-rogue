"use client";
import { useI18n, type Lang } from "@/i18n";

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: "en", label: "EN" },
  { lang: "ja", label: "JA" },
];

/** 言葉の切り替え（EN / JA）。文字はどちらの言葉でも読める略号だけにする */
export default function LangToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      data-lang-toggle
      role="group"
      aria-label={`🌐 ${t.common.language}`}
      className="flex overflow-hidden rounded-lg border border-[#334155] bg-[#0F1B2E] text-[11px] font-black"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          data-lang={o.lang}
          onClick={() => setLang(o.lang)}
          aria-pressed={lang === o.lang}
          className={`px-2.5 py-1.5 [@media(max-height:700px)]:px-2 [@media(max-height:700px)]:py-1 transition-colors ${
            lang === o.lang ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
