import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import { languageAlternates, ogImage } from "@/lib/seo";

const TITLE = "How to Play Mine Rogue | A Roguelike Dive Through Minefields";
const DESCRIPTION =
  "Learn how to play Mine Rogue, a free browser game that mixes Minesweeper with a roguelike. Dodge the mines, clear floor after floor, collect skills and see how deep you can go.";

const IMAGE = ogImage("en");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/en/how-to-play", ...languageAlternates("/how-to-play", "/en/how-to-play") },
  openGraph: {
    type: "article",
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    url: "/en/how-to-play",
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

export default function HowToPlayPageEn() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-[#E2E8F0]">
      <div className="max-w-sm mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-black text-center">How to Play Mine Rogue</h1>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-2">What is Mine Rogue?</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            A browser game that blends Minesweeper with a roguelike. Dig through floor after floor
            while dodging mines, pick up skills, and push for deeper levels.
          </p>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-3">Basic Rules</h2>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">1</span>
              <span>In &quot;⛏ Dig&quot; mode, tap a tile to open it</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">2</span>
              <span>A number shows how many mines touch that tile</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">3</span>
              <span>In &quot;🚩 Flag&quot; mode, mark tiles you think hide a mine</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#10B981] font-black shrink-0">4</span>
              <span>Open every safe tile on the floor to move on to the next one</span>
            </li>
          </ol>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-2">Skills</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Each time you clear a floor, you pick a skill. Skills are special powers that give you
            an edge. Combine them to dive even deeper.
          </p>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-2">Tips</h2>
          <ul className="space-y-1.5 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">⚡</span>
              <span>Play it safe early on — corners are a good place to start</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">⚡</span>
              <span>Use flags to keep track of where the mines are</span>
            </li>
          </ul>
        </section>

        <section className="bg-[#0F172A] rounded-2xl p-5 border border-[#1E3A5F]">
          <h2 className="text-lg font-black text-[#10B981] mb-3">Features</h2>
          <ul className="space-y-1.5 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span> Completely free
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span> No sign-up
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span> Works on phones
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10B981]">✓</span>
              Roguelike runs play out differently every time
            </li>
          </ul>
        </section>

        <AdBanner />

        <div className="text-center">
          <Link
            href="/en"
            className="inline-block py-3 px-8 rounded-2xl bg-[#10B981] hover:bg-emerald-400 text-white font-black text-base transition-colors"
          >
            Play the Game
          </Link>
        </div>
      </div>
      <Footer lang="en" altHref="/how-to-play" />
    </div>
  );
}
