import Game from "@/components/Game";

// 言葉はブラウザに合わせる（日本語なら日本語、それ以外は英語）
export default function Page() {
  return <Game route="auto" />;
}
