import Intro from '@/components/me/Intro';
import WhereIveBeen from '@/components/me/WhereIveBeen';
import ThingsILove from '@/components/me/ThingsILove';
import ThingsICantDo from '@/components/me/ThingsICantDo';
import Cucumbers from '@/components/me/Cucumbers';
import LetsTalk from '@/components/me/LetsTalk';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  return (
    <div style={{ paddingTop: 46 }}>
      <Intro />
      <WhereIveBeen />
      <ThingsILove />
      <ThingsICantDo />
      <Cucumbers />
      <LetsTalk />
    </div>
  );
}
