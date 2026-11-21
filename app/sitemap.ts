import type { MetadataRoute } from "next";

// 静的に書き出す（配信版の output: export でも作れるように）
export const dynamic = "force-static";

const BASE_URL = "https://mine-rogue.vercel.app";

/** 日本語と英語の対のページ。どちらの言葉でも検索で見つかるように、両方を互いの別の言葉として載せる */
const PAGES: {
  ja: string;
  en: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}[] = [
  { ja: "/", en: "/en", changeFrequency: "weekly", priority: 1 },
  { ja: "/how-to-play", en: "/en/how-to-play", changeFrequency: "monthly", priority: 0.5 },
  { ja: "/privacy", en: "/en/privacy", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.flatMap((p) => {
    const languages = { ja: `${BASE_URL}${p.ja}`, en: `${BASE_URL}${p.en}` };
    return [p.ja, p.en].map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
      alternates: { languages },
    }));
  });
}
