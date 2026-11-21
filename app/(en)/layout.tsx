import type { Metadata } from "next";
import "../globals.css";
import RootDocument, { rootMetadata } from "@/components/RootDocument";

// 英語のページ（/en の下）
export const metadata: Metadata = rootMetadata("en");

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
