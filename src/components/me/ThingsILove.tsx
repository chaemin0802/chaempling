import { getLocale } from 'next-intl/server';
import { getLoves } from '@/lib/content';
import { Section, SectionEyebrow, SectionTitle } from './section-utils';
import Reveal from './Reveal';
import LoveGallery from './LoveGallery';

export default async function ThingsILove() {
  const loves = await getLoves();
  const locale = await getLocale();
  const isKo = locale === 'ko';

  const intro = isKo
    ? '내가 자꾸 다시 찾는 것들이야.'
    : "the stuff I keep coming back to.";
  const subline = isKo
    ? '하나라도 물어보면 멈출 줄 모르고 떠들지도 모름. 미리 경고.'
    : "ask me about any one — fair warning, I might not stop.";

  return (
    <Section>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <SectionEyebrow>02 / soft spots</SectionEyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <SectionTitle>{isKo ? '내가 사랑하는 것들' : 'Things I love'}</SectionTitle>
        </Reveal>

        <Reveal delay={0.16}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(17px, 1.6vw, 22px)',
              color: 'rgba(244,236,216,0.85)',
              marginTop: 22,
              letterSpacing: '0.01em',
            }}
          >
            {intro}
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(14px, 1.3vw, 17px)',
              color: 'rgba(244,236,216,0.6)',
              marginTop: 8,
              lineHeight: 1.55,
              letterSpacing: '0.01em',
            }}
          >
            {subline}
          </p>
        </Reveal>

        <div style={{ marginTop: 'clamp(40px, 5vh, 64px)' }}>
          <LoveGallery loves={loves} />
        </div>
      </div>
    </Section>
  );
}
