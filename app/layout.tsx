import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mine Rogue | マインスイーパー×ローグライク',
  description: 'マインスイーパーにローグライク要素を追加！フロアをクリアしてスキルを獲得、地雷を踏んだら全てリセット。どこまで潜れるか挑戦しよう。',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1F2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9336081041068058"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-[#111827] min-h-screen">{children}</body>
    </html>
  );
}
