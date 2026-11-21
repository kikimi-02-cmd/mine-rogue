import type { MetadataRoute } from "next";

// 静的に書き出す（配信版の output: export でも作れるように）
export const dynamic = "force-static";

const BASE_URL = "https://mine-rogue.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE_URL}/how-to-play`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
