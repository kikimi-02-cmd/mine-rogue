'use client';

import { IS_DIST } from '@/lib/dist';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface Props {
  className?: string;
}

export default function AdUnit({ className = '' }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (IS_DIST) return;
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense未ロード時などは無視 */
    }
  }, []);

  // 配信版では広告を出さない
  if (IS_DIST) return null;
  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9336081041068058"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
