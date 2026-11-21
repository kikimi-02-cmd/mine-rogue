"use client";
import { useEffect } from "react";

const KEYS = new Set([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End"]);

/** 配信版: 枠の中で遊ぶとき、矢印キーやスペースで親のページが動かないようにする */
export default function NoKeyScroll() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (KEYS.has(e.key)) e.preventDefault();
    }
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
