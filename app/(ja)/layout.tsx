import type { Metadata } from "next";
import "../globals.css";
import RootDocument, { rootMetadata } from "@/components/RootDocument";

// 日本語のページ（/・/how-to-play・/privacy）。/ はブラウザの言葉で日本語／英語を出し分ける
export const metadata: Metadata = rootMetadata("ja");

export default function JaLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="ja">{children}</RootDocument>;
}
