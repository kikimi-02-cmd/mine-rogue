"use client";
// 画面の言葉の出し分け。
// 決め方: 手で選んだ言葉（この端末に保存）> 配信版は英語 > /en のページは英語 > ブラウザの言葉が日本語なら日本語、それ以外は英語
import { createContext, useContext } from "react";
import { ja, type Dict } from "./ja";
import { en } from "./en";

export type { Lang } from "./lang";
import { type Lang } from "./lang";
export { resolveLang, loadLangChoice, saveLangChoice, browserPrefersJa, localePath, isCrawler } from "./lang";
export const DICTS: Record<Lang, Dict> = { ja, en };
export { ja, en };
export type { Dict };

interface I18nValue {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue>({ lang: "ja", t: ja, setLang: () => {} });

export const I18nProvider = I18nContext.Provider;

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/** スキルの名前と説明（辞書に無ければ元のまま） */
export function skillText(t: Dict, s: { id: string; name: string; description?: string }) {
  const d = t.skills[s.id];
  return { name: d?.name ?? s.name, description: d?.description ?? s.description ?? "" };
}
