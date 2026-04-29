'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Section } from './section-utils';
import Hello from './Hello';
import Reveal from './Reveal';

export default function Intro() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const lines = isKo
    ? [
        '항상 초보, 이미 게임 속 — 그게 나야.',
        '좋아 좋아, 좀 더 얘기해줄게.',
        '나는 서울의 그래픽 디자이너 임채민이야.',
        '그래픽, 브랜딩, 패키지, 편집, 모션, AI까지 두루 작업해.',
        '그래도 가장 좋아하는 건 손에 잡히는 디자인이야.',
        '낯선 도시에서 길 잃기, 생각하기, 고전 문학, 만두를 사랑하고, 오이는 극혐.',
        '더 궁금하면?\n계속 스크롤.',
      ]
    : [
        "Always a beginner, already in the game — yeah, that's me.",
        'ok ok, let me tell you a bit more.',
        "I'm Chaemin Lim, a graphic designer based in Seoul.",
        'I do graphic, branding, packaging, editorial, motion — and lately, AI too.',
        'but what I love most is design you can hold in your hand.',
        'I love getting lost in unfamiliar cities, thinking, classic literature, dumplings — and I HATE cucumbers.',
        'Curious for more?\nJust keep scrolling.',
      ];

  return (
    <Section minHeight="100vh">
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 'calc(100vh - clamp(120px, 20vh, 240px))',
        }}
      >
        <Reveal x={-30}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(64px, 11vw, 168px)',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              margin: 0,
              color: 'var(--color-text)',
            }}
          >
            <Hello />
          </h1>
        </Reveal>

        <div style={{ marginTop: 'clamp(28px, 4vh, 48px)' }}>
          {lines.map((line, idx) => (
            <Reveal key={idx} delay={0.25 + idx * 0.08} y={14} x={0} duration={0.6}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:
                    idx === 0
                      ? 'clamp(22px, 2.6vw, 34px)'
                      : 'clamp(17px, 1.6vw, 22px)',
                  fontWeight: idx === 0 ? 500 : 300,
                  lineHeight: 1.55,
                  color:
                    idx === 0
                      ? 'rgba(244,236,216,0.95)'
                      : 'rgba(244,236,216,0.75)',
                  marginTop: idx === 0 ? 0 : 'clamp(10px, 1.4vh, 16px)',
                  letterSpacing: '0.01em',
                  whiteSpace: 'pre-line',
                }}
              >
                {line}
              </p>
            </Reveal>
          ))}
          <Reveal delay={0.25 + lines.length * 0.08} y={14} x={0} duration={0.6}>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: 'clamp(20px, 1.8vw, 24px)',
                color: 'rgba(244,236,216,0.6)',
                marginTop: 'clamp(14px, 1.8vh, 22px)',
                lineHeight: 1,
              }}
            >
              ↓
            </motion.div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
