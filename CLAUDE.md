# mine-rogue（マインスイーパー×ローグライク）

マインスイーパーにローグライク要素を追加したブラウザゲーム。盤面クリアごとにスキル取得、死んだらリセット。

## Tech Stack

- Next.js 14+ (App Router)
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

### フロア構成（`src/lib/board.ts` getFloorConfig が SoT）
| フロア | 盤面サイズ | 地雷数 |
|--------|-----------|--------|
| 1F | 5×5 | 3 |
| 2F | 5×5 | 4 |
| 3F | 6×6 | 5 |
| 4F | 6×6 | 6 |
| 5F以降 | 7×7 | `min(7+(floor-5), 10)`（最大10で頭打ち） |

### スキルシステム
フロアクリア時に3つの中からランダムで1つ選択

## Commands
- Dev: npm run dev
- Build: npm run build
- Lint: npm run lint
