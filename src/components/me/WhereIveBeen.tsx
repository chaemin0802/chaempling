import { getLocale } from 'next-intl/server';
import { getCities } from '@/lib/content';
import { Section, SectionEyebrow, SectionTitle } from './section-utils';
import Globe from './Globe';
import Reveal from './Reveal';

export default async function WhereIveBeen() {
  const cities = await getCities();
  const locale = await getLocale();
  const isKo = locale === 'ko';

  const intro = isKo
    ? '한 번 돌려봐.'
    : 'go ahead, give it a spin.';
  const subline = isKo
    ? '여기 박힌 별들, 전부 내가 직접 걸어본 도시야.\n별 위에 마우스 올리면 거기서 뭐 했는지 살짝 알려줄게.'
    : "those stars? every one of them, a city I've actually walked.\nhover any star and I'll tell you what happened there.";

  return (
    <Section>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <SectionEyebrow>01 / passport says</SectionEyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <SectionTitle>{isKo ? '내가 가본 곳들' : "Where I've been"}</SectionTitle>
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
              marginTop: 10,
              lineHeight: 1.55,
              letterSpacing: '0.01em',
              whiteSpace: 'pre-line',
            }}
          >
            {subline}
          </p>
        </Reveal>

        <Reveal delay={0.32} y={20} x={0} duration={0.7}>
          <div style={{ marginTop: 'clamp(36px, 5vh, 56px)' }}>
            <Globe cities={cities} />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
