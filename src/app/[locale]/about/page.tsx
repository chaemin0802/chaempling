import Intro from '@/components/me/Intro';
import WhereIveBeen from '@/components/me/WhereIveBeen';
import ThingsILove from '@/components/me/ThingsILove';
import ThingsICantDo from '@/components/me/ThingsICantDo';
import Cucumbers from '@/components/me/Cucumbers';
import OnAI from '@/components/me/OnAI';
import LetsTalk from '@/components/me/LetsTalk';
import { setRequestLocale } from 'next-intl/server';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div style={{ paddingTop: 46 }}>
      <Intro />
      <WhereIveBeen />
      <ThingsILove />
      <ThingsICantDo />
      <Cucumbers />
      <OnAI />
      <LetsTalk />
    </div>
  );
}
