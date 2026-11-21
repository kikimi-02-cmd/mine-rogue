import type { Metadata } from "next";
import { IS_DIST } from "@/lib/dist";
import NoKeyScroll from "@/components/NoKeyScroll";
import type { Lang } from "@/i18n/lang";
import { ja } from "@/i18n/ja";
import { en } from "@/i18n/en";
import { SITE_URL, languageAlternates, ogImage } from "@/lib/seo";

/** 入口の題・説明・共有用の情報（/ と /en） */
export function rootMetadata(lang: Lang): Metadata {
  const t = lang === "ja" ? ja : en;
  const path = lang === "ja" ? "/" : "/en";
  const share: Metadata = {
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: path, ...languageAlternates("/", "/en") },
    openGraph: {
      type: "website",
      locale: lang === "ja" ? "ja_JP" : "en_US",
      alternateLocale: lang === "ja" ? ["en_US"] : ["ja_JP"],
      url: path,
      siteName: "Mine Rogue",
      title: t.meta.title,
      description: t.meta.description,
      images: [ogImage(lang)],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [ogImage(lang)],
    },
  };
  return {
    title: t.meta.title,
    description: t.meta.description,
    manifest: "/manifest.json",
    applicationName: "Mine Rogue",
    // 配信版はサイトの外に置くので、サイトへのリンクを含む共有用の情報は付けない
    ...(IS_DIST ? {} : share),
  };
}

export default function RootDocument({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang}>
      {/* eslint-disable-next-line @next/next/no-head-element -- ルートのレイアウト（app/(ja)・app/(en)）の <head> */}
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
        {!IS_DIST && (
        <>
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
              gtag('config', 'G-VCZGFL2T13', { allow_google_signals: false, allow_ad_personalization_signals: false });
            `,
          }}
        />
        </>
        )}
      </head>
      <body className="antialiased bg-[#0A1628]">
        {IS_DIST && <NoKeyScroll />}
        {children}
      </body>
    </html>
  );
}
