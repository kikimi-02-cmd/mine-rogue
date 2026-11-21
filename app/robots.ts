import type { MetadataRoute } from "next";

// 静的に書き出す（配信版の output: export でも作れるように）
export const dynamic = "force-static";

const BASE_URL = "https://mine-rogue.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
