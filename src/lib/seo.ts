import type { Metadata } from "next";

export const SITE_URL = "https://mine-rogue.vercel.app";

/** 日本語と英語の対のページ（検索で両方見つかるように hreflang を付ける）。x-default は日本語の側（/ はブラウザの言葉に合わせる） */
export function languageAlternates(jaPath: string, enPath: string): NonNullable<Metadata["alternates"]> {
  return {
    languages: { ja: jaPath, en: enPath, "x-default": jaPath },
  };
}

const OG_ALT = {
  ja: "Mine Rogue — 数字のマスと旗の盤、スキルのアイコン。地雷の盤を潜るローグライク",
  en: "Mine Rogue — a board of numbered tiles and flags with skill icons. A roguelike dive through minefields",
} as const;

/** リンクの絵（1200×630）。作り直しは npm run og */
export function ogImage(lang: "ja" | "en") {
  return { url: `/og-${lang}.png`, width: 1200, height: 630, alt: OG_ALT[lang] };
}
