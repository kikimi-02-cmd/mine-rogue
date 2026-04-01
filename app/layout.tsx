import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mine Rogue | マインスイーパー×ローグライク",
  description:
    "マインスイーパーにローグライク要素を追加！フロアをクリアしてスキルを獲得、地雷を踏んだら全てリセット。どこまで潜れるか挑戦しよう。",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="theme-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9336081041068058"
          crossOrigin="anonymous"
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VCZGFL2T13"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VCZGFL2T13');
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#0A1628]">{children}</body>
    </html>
  );
}
