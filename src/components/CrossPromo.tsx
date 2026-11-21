"use client";
import { IS_DIST } from "@/lib/dist";
import { useI18n } from "@/i18n";

const APPS = [
  {
    name: 'ポケモジ',
    desc: 'ポケモン名を当てる絵文字クイズ',
    href: 'https://pokemoji.vercel.app/',
    emoji: '🔤',
    color: 'border-indigo-700',
  },
  {
    name: 'ふたりの記念日',
    desc: '記念日カウントダウン＆ギフト提案',
    href: 'https://futari-kinenbi.vercel.app/',
    emoji: '💑',
    color: 'border-pink-700',
  },
  {
    name: 'AIなぞなぞ',
    desc: 'AIが出題するオリジナルなぞなぞ',
    href: 'https://ai-nazonazo.vercel.app/',
    emoji: '🧩',
    color: 'border-violet-700',
  },
];

export default function CrossPromo() {
  const { t, lang } = useI18n();
  // 配信版では外部へのリンクを出さない。紹介するアプリは日本語だけなので、英語の画面でも出さない
  if (IS_DIST || lang !== "ja") return null;
  return (
    <div className="mt-4 px-4">
      <p className="text-xs font-bold text-gray-500 mb-2">{t.crossPromo.heading}</p>
      <div className="flex flex-col gap-2">
        {APPS.map((app) => (
          <a
            key={app.name}
            href={app.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 bg-[#1F2937] rounded-xl px-3 py-2 border ${app.color} hover:opacity-80 transition-opacity`}
          >
            <span className="text-xl">{app.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{app.name}</p>
              <p className="text-[10px] text-gray-400">{app.desc}</p>
            </div>
            <span className="text-[10px] text-gray-500 shrink-0">{t.crossPromo.open}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
