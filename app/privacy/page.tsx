import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

const TITLE = "プライバシーポリシー｜Mine Rogue";
const DESCRIPTION =
  "Mine Rogue（地雷の盤を潜るローグライク）のプライバシーポリシー。端末の中に残す記録、計測と広告のしくみ、問い合わせの窓口について。";

// 共有用の題・説明・URL をこのページのものにする（画像はトップと同じ）
const IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Mine Rogue — 数字のマスと旗の盤、スキルのアイコン。地雷の盤を潜るローグライク",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "article",
    locale: "ja_JP",
    url: "/privacy",
    siteName: "Mine Rogue",
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

const CONTACT = "info@honnex.app";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
      <h2 className="text-base font-black text-[#10B981] mb-2">{title}</h2>
      <div className="space-y-2 text-sm text-gray-300 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-[#E2E8F0]">
      <div className="max-w-sm mx-auto px-4 py-8 space-y-5">
        <h1 className="text-2xl font-black text-center">プライバシーポリシー</h1>
        <p className="text-xs text-gray-400 text-center">制定日: 2026年11月21日</p>

        <Section title="1. 運営者">
          <p>Mine Rogue（以下「本サービス」）は、いばらきが運営しています。</p>
          <p>
            戸籍上の氏名と住所は、請求があれば遅滞なく開示します。請求は下の「6. お問い合わせ」の窓口へお送りください。
          </p>
        </Section>

        <Section title="2. 個人の情報について">
          <p>
            本サービスは、登録やログインなしで遊べます。氏名・メールアドレス・電話番号・住所などの個人の情報を、運営者が集めることはありません。
          </p>
        </Section>

        <Section title="3. ブラウザの中に残す記録（localStorage）">
          <p>
            遊びの記録は、お使いのブラウザの中（localStorage）にだけ保存します。運営者のサーバーには送りません。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-400">
            <li>ベスト記録・深層モードの最深記録・通算のプレイ回数・開けたマスの数</li>
            <li>取ったスキルの回数（図鑑）・初回の説明の進み具合</li>
            <li>連続の日数・お休み券・灯り（ログインボーナス）</li>
            <li>毎日の挑戦の日ごとの記録（直近 60 日分）</li>
            <li>はじめて開いた日（日付だけ）</li>
          </ul>
          <p>ブラウザの設定から、サイトのデータを消すといつでも削除できます。</p>
        </Section>

        <Section title="4. アクセスの計測（Google アナリティクス）">
          <p>
            本サービスは、使われ方を知って遊びやすくするために Google アナリティクスを使っています。Google アナリティクスは cookie を使い、閲覧の情報を Google に送ります。この情報に、氏名などの個人を特定する情報は含まれません。
          </p>
          <p>
            運営者が送るのは、遊びの出来事（開始・クリア・共有など）と、到達フロアや連続の日数を丸めた値・日付だけです。計測の情報を広告の個人向け配信に使う設定（Google シグナル・広告のカスタマイズ）は切っています。
          </p>
          <p>
            Google によるデータの扱いは
            <a
              href="https://policies.google.com/technologies/partner-sites?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              Google のポリシー
            </a>
            をご覧ください。計測を止めたい場合は
            <a
              href="https://tools.google.com/dlpage/gaoptout?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              オプトアウト アドオン
            </a>
            を使えます。
          </p>
        </Section>

        <Section title="5. 広告（Google AdSense）">
          <p>
            本サービスは、Google AdSense による広告を表示しています。Google などの配信事業者は cookie を使い、このサイトや他のサイトへの過去のアクセスにもとづいて広告を出すことがあります。
          </p>
          <p>
            個人に合わせた広告は
            <a
              href="https://adssettings.google.com/?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              広告設定
            </a>
            で無効にできます。
          </p>
        </Section>

        <Section title="6. お問い合わせ">
          <p>
            本ポリシーや本サービスについてのお問い合わせは、次の窓口までメールでお送りください。
          </p>
          <p className="font-mono text-emerald-300">
            <a href={`mailto:${CONTACT}`} className="underline">
              {CONTACT}
            </a>
          </p>
        </Section>

        <Section title="7. 改定">
          <p>
            本ポリシーは、必要に応じて改定することがあります。改定したときは、このページでお知らせします。
          </p>
        </Section>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block py-3 px-8 rounded-2xl bg-[#10B981] hover:bg-emerald-400 text-white font-black text-base transition-colors"
          >
            ゲームに戻る
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
