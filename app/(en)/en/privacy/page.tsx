import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { languageAlternates, ogImage } from "@/lib/seo";

// 日本語のプライバシーポリシー（app/(ja)/privacy）の英訳。中身（意味）は日本語版と同じにする。
// 日本語版を直したら、ここも同じ意味に直す。

const TITLE = "Privacy Policy | Mine Rogue";
const DESCRIPTION =
  "Privacy policy for Mine Rogue (a roguelike dive through minefields): the records kept on your device, how analytics and ads work, and how to contact us.";

const IMAGE = ogImage("en");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/en/privacy", ...languageAlternates("/privacy", "/en/privacy") },
  openGraph: {
    type: "article",
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    url: "/en/privacy",
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

export default function PrivacyPageEn() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-[#E2E8F0]">
      <div className="max-w-sm mx-auto px-4 py-8 space-y-5">
        <h1 className="text-2xl font-black text-center">Privacy Policy</h1>
        <p className="text-xs text-gray-400 text-center">Established: November 21, 2026</p>

        <Section title="1. Operator">
          <p>Mine Rogue (the &quot;Service&quot;) is operated by Ibaraki.</p>
          <p>
            We will disclose our legal name and address without delay upon request. Please send
            requests to the contact listed in &quot;6. Contact&quot; below.
          </p>
        </Section>

        <Section title="2. Personal Information">
          <p>
            You can play the Service without registering or logging in. The operator does not
            collect personal information such as your name, email address, phone number or address.
          </p>
        </Section>

        <Section title="3. Records Kept in Your Browser (localStorage)">
          <p>
            Your play records are saved only inside your browser (localStorage). They are not sent
            to the operator&apos;s servers.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-400">
            <li>Best record, deepest Deep Mode record, total runs played, tiles opened</li>
            <li>How many times you picked each skill (codex), progress through the first-time tips</li>
            <li>Streak days, rest passes, lanterns (daily bonus)</li>
            <li>Daily challenge records per day (the last 60 days)</li>
            <li>The day you first opened the game (date only)</li>
          </ul>
          <p>You can delete them at any time by clearing the site data in your browser settings.</p>
        </Section>

        <Section title="4. Analytics (Google Analytics)">
          <p>
            The Service uses Google Analytics to understand how it is used and make it easier to
            play. Google Analytics uses cookies and sends browsing information to Google. This
            information does not include anything that identifies you personally, such as your name.
          </p>
          <p>
            The operator sends only gameplay events (start, clear, share, etc.), rounded values such
            as the floor reached and streak days, and dates. The settings that would use analytics
            data for personalized advertising (Google signals and ad personalization) are turned off.
          </p>
          <p>
            For how Google handles data, see{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              Google&apos;s policy
            </a>
            . To stop analytics, you can use the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              opt-out add-on
            </a>
            .
          </p>
        </Section>

        <Section title="5. Advertising (Google AdSense)">
          <p>
            The Service shows ads through Google AdSense. Google and other ad vendors use cookies
            and may show ads based on your past visits to this site and other sites.
          </p>
          <p>
            You can turn off personalized ads in{" "}
            <a
              href="https://adssettings.google.com/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              Ad Settings
            </a>
            .
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            For questions about this policy or the Service, please email us at the address below.
          </p>
          <p className="font-mono text-emerald-300">
            <a href={`mailto:${CONTACT}`} className="underline">
              {CONTACT}
            </a>
          </p>
        </Section>

        <Section title="7. Changes">
          <p>
            We may update this policy as needed. When we do, we will announce it on this page.
          </p>
        </Section>

        <div className="text-center">
          <Link
            href="/en"
            className="inline-block py-3 px-8 rounded-2xl bg-[#10B981] hover:bg-emerald-400 text-white font-black text-base transition-colors"
          >
            Back to the Game
          </Link>
        </div>
      </div>
      <Footer lang="en" altHref="/privacy" />
    </div>
  );
}
