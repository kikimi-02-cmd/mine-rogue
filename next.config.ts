import type { NextConfig } from "next";

// 配信版（scripts/build-dist.sh）: 静的に書き出して zip にする。ふつうのビルド（Vercel）は今まで通り
const isDist = process.env.NEXT_PUBLIC_DIST === "1";

const nextConfig: NextConfig = isDist
  ? {
      output: "export",
      // このバージョンでは書き出し先が distDir になる
      distDir: "out",
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
