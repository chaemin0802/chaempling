import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Nav from '@/components/Nav';
import CursorGlow from '@/components/CursorGlow';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Chaemin Lim — Graphic & AI Designer',
  description: 'Portfolio of Chaemin Lim, a graphic and AI designer.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ko')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CursorGlow />
          <Nav />
          <main style={{ paddingTop: 0 }}>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
