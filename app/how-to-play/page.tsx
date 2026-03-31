import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mine Rogueの遊び方 | マインスイーパー×ローグライク",
  description:
    "Mine Rogueの遊び方を解説。マインスイーパーとローグライクを融合した無料ブラウザゲームです。地雷を避けてフロアを踏破し、スキルを獲得しながらどこまで深く潜れるか挑戦しよう。",
};

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-[#E2E8F0]">
      <div className="max-w-sm mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-black text-center">Mine Rogueの遊び方</h1>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-2">
            Mine Rogueとは
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            マインスイーパーとローグライクを融合したブラウザゲームです。地雷を避けながらフロアを掘り進め、スキルを獲得してより深い階層を目指します。
          </p>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-3">基本ルール</h2>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">①</span>
              <span>「⛏ 掘る」モードでセルをタップして開く</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">②</span>
              <span>数字は周囲の地雷数を示す</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">③</span>
              <span>「🚩 旗」モードで地雷と思われるセルにフラグを立てる</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">④</span>
              <span>フロアの安全なセルを全て開くと次のフロアへ進める</span>
            </li>
          </ol>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-2">
            スキルシステム
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            フロアクリア時にランダムでスキルを獲得。スキルはゲームを有利に進める特殊能力です。スキルを組み合わせてより深い階層を目指そう。
          </p>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-2">攻略のコツ</h2>
          <ul className="space-y-1.5 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">⚡</span>
              <span>序盤は慎重に、角から開くのが安全</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">⚡</span>
              <span>フラグを活用して地雷の位置を記録しよう</span>
            </li>
          </ul>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-3">特徴</h2>
          <ul className="space-y-1.5 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span> 完全無料
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span> 登録不要
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span> スマホ対応
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span>
              ローグライク要素で毎回異なる展開
            </li>
          </ul>
        </section>

        <AdBanner />

        <div className="text-center">
          <Link
            href="/"
            className="inline-block py-3 px-8 rounded-2xl bg-[#10B981] hover:bg-emerald-400 text-white font-black text-base transition-colors"
          >
            ゲームをプレイ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
