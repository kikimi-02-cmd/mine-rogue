# mine-rogue（マインスイーパー×ローグライク）

マインスイーパーにローグライク要素を追加したブラウザゲーム。盤面クリアごとにスキル取得、死んだらリセット。

## Tech Stack

- Next.js 16 (App Router)。破壊的変更あり — 書く前に `node_modules/next/dist/docs/` の該当ガイドを読む
- TypeScript (strict)
- Tailwind CSS
- Vercel でホスティング
- ゲームデータはメモリ管理（ランごとにリセット）
- ベストスコアはlocalStorage保存

## Current Phase
Phase: Build

## ゲーム仕様（厳守）

### 基本コンセプト
- マインスイーパーのルールがベース
- 1フロアクリアするごとに次のフロアへ進む
- フロアクリア時にスキルを1つ獲得
- 地雷を踏んだらゲームオーバー → 最初からやり直し（パーマデス）

### フロア構成
実際のゲーム（`src/lib/board.ts` の `getFloorConfig`）に合わせた表（2026-11-21 Owner 決定: 実物を正とする）。
| フロア | 盤面サイズ | 地雷数 |
|--------|-----------|--------|
| 1F | 5×5 | 3 |
| 2F | 5×5 | 4 |
| 3F | 6×6 | 5 |
| 4F | 6×6 | 6 |
| 5F | 7×7 | 7 |
| 6F | 7×7 | 8 |
| 7F | 7×7 | 9 |
| 8F+ | 7×7 | 10（上限） |

大きな盤・濃い地雷の歯ごたえは、この表とは別の「深層モード」（`src/lib/progress.ts` の `getDeepFloorConfig`）が受け持つ。

### スキルシステム
フロアクリア時に3つの中からランダムで1つ選択

## Commands
- Dev: npm run dev
- Build: npm run build
- Lint: npm run lint
