import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-6 border-t border-gray-700 bg-[#111827]">
      <div className="max-w-sm mx-auto px-4 flex flex-col items-center gap-3 text-xs text-gray-500">
        <div className="flex gap-4">
          <Link href="/how-to-play" className="hover:text-gray-300 transition-colors">
            遊び方
          </Link>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            プライバシーポリシー
          </Link>
        </div>
        <p>© 2026 mine-rogue</p>
      </div>
    </footer>
  );
}
