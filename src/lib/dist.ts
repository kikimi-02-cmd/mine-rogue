/**
 * 配信版（ゲームの配信サイトに置く zip）の作りかどうか。
 * scripts/build-dist.sh が NEXT_PUBLIC_DIST=1 でビルドする。
 * 配信版では: 外部へのリンク・広告・計測を外し、矢印キーやスペースでページが動かないようにする。
 */
export const IS_DIST = process.env.NEXT_PUBLIC_DIST === "1";
