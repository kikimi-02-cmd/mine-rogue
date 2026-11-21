// 言葉の決め方（純粋な関数と保存だけ。React を使わないのでテストから読める）
export type Lang = "ja" | "en";

const LANG_KEY = "mine_rogue_lang";

export function loadLangChoice(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "ja" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

export function saveLangChoice(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* 保存できない端末では、その場だけ切り替える */
  }
}

/** ブラウザの言葉が日本語か */
export function browserPrefersJa(languages: readonly string[]): boolean {
  const first = languages.find((l) => typeof l === "string" && l !== "");
  return !!first && first.toLowerCase().startsWith("ja");
}

/** 検索のロボットか（/ は日本語のページとして載せ、英語は /en で載せるため、ロボットにはそのページの言葉を見せる） */
export function isCrawler(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|mediapartners|lighthouse/i.test(userAgent);
}

/**
 * はじめに出す言葉。
 * @param route そのページの言葉（/ は "auto"、/en は "en"）
 */
export function resolveLang(opts: {
  choice: Lang | null;
  isDist: boolean;
  route: "auto" | Lang;
  languages: readonly string[];
  /** 検索のロボット（/ は日本語で見せる） */
  crawler?: boolean;
}): Lang {
  if (opts.choice) return opts.choice;
  if (opts.isDist) return "en";
  if (opts.route !== "auto") return opts.route;
  if (opts.crawler) return "ja";
  return browserPrefersJa(opts.languages) ? "ja" : "en";
}

/** 遊び方のページなどへのリンク（英語は /en の下） */
export function localePath(lang: Lang, path: string): string {
  if (lang === "ja") return path;
  return path === "/" ? "/en" : `/en${path}`;
}
