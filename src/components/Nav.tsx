'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

export default function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 grid items-center"
      style={{
        height: 46,
        gridTemplateColumns: '1fr auto 1fr',
        padding: '0 clamp(24px, 4vw, 60px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(17,17,17,0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Link
        href={`/${locale}`}
        className="text-base font-semibold justify-self-start"
        style={{ fontSize: 16 }}
      >
        Chaemin Lim
      </Link>

      <div
        className="grid items-center text-sm justify-self-center"
        style={{ gridTemplateColumns: '80px 80px 80px' }}
      >
        <Link
          href={`/${locale}/work`}
          className="opacity-70 hover:opacity-100 transition-opacity text-center font-semibold"
        >
          {t('work')}
        </Link>
        <Link
          href={`/${locale}/about`}
          className="opacity-70 hover:opacity-100 transition-opacity text-center"
        >
          {t('about')}
        </Link>
        <Link
          href={`/${locale}/about#talk`}
          className="opacity-70 hover:opacity-100 transition-opacity text-center"
        >
          {t('contact')}
        </Link>
      </div>

      <div className="justify-self-end">
        <LocaleSwitcher />
      </div>
    </nav>
  );
}
