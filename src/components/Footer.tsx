import Link from 'next/link';
import type { Lang } from '@/i18n/lang';
import { localePath } from '@/i18n/lang';
import { ja } from '@/i18n/ja';
import { en } from '@/i18n/en';

interface Props {
  lang?: Lang;
  /** もう一方の言葉の同じページ */
  altHref?: string;
}

export default function Footer({ lang = 'ja', altHref }: Props) {
  const t = lang === 'ja' ? ja : en;
  return (
    <footer className="py-6 border-t border-gray-700 bg-[#111827]">
      <div className="max-w-sm mx-auto px-4 flex flex-col items-center gap-3 text-xs text-gray-500">
        <div className="flex gap-4">
          <Link href={localePath(lang, '/how-to-play')} className="hover:text-gray-300 transition-colors">
            {t.footer.howTo}
          </Link>
          <Link href={localePath(lang, '/privacy')} className="hover:text-gray-300 transition-colors">
            {t.footer.privacy}
          </Link>
          {altHref && (
            <a data-lang-alt href={altHref} hrefLang={lang === 'ja' ? 'en' : 'ja'} className="hover:text-gray-300 transition-colors">
              🌐 {lang === 'ja' ? 'EN' : 'JA'}
            </a>
          )}
        </div>
        <p>© 2026 mine-rogue</p>
      </div>
    </footer>
  );
}
