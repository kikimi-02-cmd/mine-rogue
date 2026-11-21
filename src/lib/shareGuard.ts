// 共有の文を送る前の見張り。他の SNS やサービスの名前・リンクを落とす。
// 落としきれない（見張りの後にもまだ名前が残る）場合は null を返し、共有しない（fail-closed）。

// 英字の名前は単語の境界で見る（online・deadline などは消さない）
function latin(word: string): RegExp {
  return new RegExp(`(?<![A-Za-z])${word}s?(?![A-Za-z])`, "giu");
}

// 名前そのもの（大文字小文字は問わない）
const BANNED_NAMES: RegExp[] = [
  /𝕏/gu,
  latin("twitter"),
  /ツイッター/gu,
  /ツイート/gu,
  latin("tweet"),
  latin("line"),
  /ライン/gu,
  latin("instagram"),
  /インスタグラム/gu,
  /インスタ/gu,
  latin("tiktok"),
  /ティックトック/gu,
  latin("youtube"),
  /ユーチューブ/gu,
  latin("facebook"),
  /フェイスブック/gu,
  latin("threads"),
  /スレッズ/gu,
  latin("discord"),
  /ディスコード/gu,
  latin("reddit"),
  /レディット/gu,
  latin("bluesky"),
  latin("mastodon"),
];

// それらのサービスのドメイン（x.com / t.co なども含む）
const BANNED_URL =
  /https?:\/\/(?:[a-z0-9-]+\.)*(?:x\.com|t\.co|twitter\.com|line\.me|instagram\.com|tiktok\.com|youtube\.com|youtu\.be|facebook\.com|fb\.com|threads\.net|discord\.gg|discord\.com|reddit\.com|bsky\.app)\S*/giu;

// 単独の「X」（「Xで」「X に」「on X」など）。英単語の一部（MAX 等）は対象外。
const STANDALONE_X = /(?<![A-Za-z0-9])X(?![A-Za-z0-9])/gu;

function strip(text: string): string {
  let out = text.replace(BANNED_URL, "");
  for (const re of BANNED_NAMES) out = out.replace(re, "");
  out = out.replace(STANDALONE_X, "");
  // 消したあとに残る空白・空行を整える
  return out
    .split("\n")
    .map((l) => l.replace(/[ \t]{2,}/g, " ").trim())
    .filter((l, i, arr) => l !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n")
    .trim();
}

export function containsBannedService(text: string): boolean {
  const reset = (re: RegExp) => {
    re.lastIndex = 0;
    return re;
  };
  if (reset(BANNED_URL).test(text)) return true;
  if (reset(STANDALONE_X).test(text)) return true;
  return BANNED_NAMES.some((re) => reset(re).test(text));
}

/** 共有の文を見張りに通す。安全なら整えた文、残る場合は null（共有しない）。 */
export function guardShareText(text: string): string | null {
  const cleaned = strip(text.normalize("NFC"));
  if (cleaned === "") return null;
  // 飾り文字（𝕏・全角など）で書かれた名前も見逃さないよう、互換分解した形でも確かめる
  if (containsBannedService(cleaned) || containsBannedService(cleaned.normalize("NFKC")))
    return null;
  return cleaned;
}
