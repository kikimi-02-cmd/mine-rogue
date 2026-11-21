import type { Skill } from "./types";
import { guardShareText } from "./shareGuard";
import { IS_DIST } from "./dist";
import { dailyShareUrl } from "./daily";

export const SITE_URL = "https://mine-rogue.vercel.app/";
export const HASHTAGS = ["#MineRogue", "#ブラウザゲーム"];

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export interface ShareResult {
  floor: number;
  skills: Pick<Skill, "icon" | "name">[];
  timer: number;
  isNewRecord?: boolean;
  /** 毎日の挑戦などの見出し（任意） */
  label?: string;
  /** 毎日の挑戦なら、そのお題の日付（リンクを受け取った人が同じ盤から遊べる） */
  dateKey?: string | null;
}

/** 共有のリンク。毎日の挑戦なら同じお題を開く ?d= をつける */
export function shareUrl(r: Pick<ShareResult, "dateKey">): string {
  return dailyShareUrl(SITE_URL, r.dateKey);
}

export function buildShareText(r: ShareResult): string {
  const icons = r.skills.length > 0 ? r.skills.map((s) => s.icon).join("") : "なし";
  return [
    `Mine Rogue ⛏${r.label ? ` ${r.label}` : ""}`,
    `到達: B${r.floor}F${r.isNewRecord ? " 🎉自己ベスト" : ""}`,
    `スキル: ${icons}`,
    `⏱ ${formatTime(r.timer)}`,
    HASHTAGS.join(" "),
    // 配信版では外部へのリンクを入れない
    ...(IS_DIST ? [] : [shareUrl(r)]),
  ].join("\n");
}

// ─── 結果のカード（PNG） ──────────────────────────────

const W = 1080;
const H = 1080;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT =
  '"Hiragino Sans","Noto Sans JP","Yu Gothic",system-ui,sans-serif';

export function drawResultCard(canvas: HTMLCanvasElement, r: ShareResult): void {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0F2340");
  bg.addColorStop(1, "#0A1628");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 盤の模様（薄く）
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#10B981";
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * 120 + 6, y * 120 + 6, 108, 108);
    }
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 題
  ctx.font = `900 64px ${FONT}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("MINE", W / 2 - 130, 120);
  ctx.fillStyle = "#34D399";
  ctx.fillText("ROGUE", W / 2 + 110, 120);
  if (r.label) {
    ctx.font = `700 34px ${FONT}`;
    ctx.fillStyle = "#93C5FD";
    ctx.fillText(r.label, W / 2, 185);
  }

  // 到達フロア
  roundRect(ctx, 140, 240, W - 280, 330, 40);
  ctx.fillStyle = "rgba(15,27,46,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(250,204,21,0.45)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.font = `700 38px ${FONT}`;
  ctx.fillStyle = "#94A3B8";
  ctx.fillText("到達フロア", W / 2, 300);
  ctx.font = `900 190px ${FONT}`;
  ctx.fillStyle = "#FACC15";
  ctx.fillText(`B${r.floor}F`, W / 2, 425);
  if (r.isNewRecord) {
    ctx.font = `900 36px ${FONT}`;
    ctx.fillStyle = "#FDE047";
    ctx.fillText("🎉 自己ベスト更新", W / 2, 535);
  }

  // 時間
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = "#94A3B8";
  ctx.fillText("経過時間", W / 2, 625);
  ctx.font = `900 64px ui-monospace,Menlo,monospace`;
  ctx.fillStyle = "#E2E8F0";
  ctx.fillText(formatTime(r.timer), W / 2, 690);

  // スキル
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = "#94A3B8";
  ctx.fillText("取ったスキル", W / 2, 775);
  const icons = r.skills.map((s) => s.icon);
  if (icons.length === 0) {
    ctx.font = `700 44px ${FONT}`;
    ctx.fillStyle = "#64748B";
    ctx.fillText("なし", W / 2, 845);
  } else {
    const shown = icons.slice(0, 12);
    const size = shown.length > 8 ? 60 : 76;
    ctx.font = `${size}px ${FONT}`;
    const gap = size + 18;
    const startX = W / 2 - ((shown.length - 1) * gap) / 2;
    shown.forEach((ic, i) => ctx.fillText(ic, startX + i * gap, 850));
    if (icons.length > shown.length) {
      ctx.font = `700 32px ${FONT}`;
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`ほか ${icons.length - shown.length}`, W / 2, 910);
    }
  }

  // 下の帯
  ctx.fillStyle = "#10B981";
  ctx.fillRect(0, H - 110, W, 110);
  ctx.font = `900 40px ${FONT}`;
  ctx.fillStyle = "#04261A";
  ctx.fillText(
    IS_DIST ? HASHTAGS[0] : `${HASHTAGS[0]}   mine-rogue.vercel.app`,
    W / 2,
    H - 55,
  );
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export async function makeResultCardFile(r: ShareResult): Promise<File | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  drawResultCard(canvas, r);
  const blob = await canvasToBlob(canvas);
  if (!blob) return null;
  return new File([blob], `mine-rogue-B${r.floor}F.png`, { type: "image/png" });
}

export type ShareOutcome = "shared" | "fallback" | "cancelled" | "blocked";

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 端末の共有（画像＋文）。使えなければ画像の保存と文のコピー。
 * 文は必ず見張り（guardShareText）を通し、通らなければ共有しない。
 */
export async function shareResult(r: ShareResult): Promise<ShareOutcome> {
  const text = guardShareText(buildShareText(r));
  if (text === null) return "blocked";
  const file = await makeResultCardFile(r);

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (typeof nav.share === "function") {
    const withFile: ShareData = file ? { files: [file], text } : { text };
    const data =
      file && nav.canShare && !nav.canShare(withFile) ? { text } : withFile;
    try {
      await nav.share(data);
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      // 共有が失敗したら保存＋コピーへ
    }
  }
  if (file) downloadFile(file);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* コピーできない端末は画像の保存だけ */
  }
  return "fallback";
}

export async function saveResultCard(r: ShareResult): Promise<boolean> {
  const file = await makeResultCardFile(r);
  if (!file) return false;
  downloadFile(file);
  return true;
}
