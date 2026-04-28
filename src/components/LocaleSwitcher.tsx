'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={() => switchLocale('en')}
        className={`px-1.5 py-0.5 transition-opacity ${
          locale === 'en' ? 'opacity-100' : 'opacity-40 hover:opacity-70'
        }`}
      >
        EN
      </button>
      <span className="opacity-30">/</span>
      <button
        onClick={() => switchLocale('ko')}
        className={`px-1.5 py-0.5 transition-opacity ${
          locale === 'ko' ? 'opacity-100' : 'opacity-40 hover:opacity-70'
        }`}
      >
        KR
      </button>
    </div>
  );
}
