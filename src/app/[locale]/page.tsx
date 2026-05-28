import HeroSection from '@/components/HeroSection';
import WorkGrid from '@/components/WorkGrid';
import { getPublishedProjects } from '@/lib/content';
import { setRequestLocale } from 'next-intl/server';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getPublishedProjects();

  return (
    <>
      <HeroSection locale={locale} />
      <section
        id="home-work"
        style={{
          padding: 'clamp(48px, 8vw, 96px) clamp(24px, 4vw, 60px) clamp(40px, 6vw, 80px)',
          scrollMarginTop: 46,
        }}
      >
        <WorkGrid projects={projects} />
      </section>
    </>
  );
}
