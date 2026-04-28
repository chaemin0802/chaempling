'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Section, SectionEyebrow, SectionTitle } from './section-utils';
import Reveal from './Reveal';

const ITEMS_EN = [
  { what: 'Swim', why: 'water is great, from the shore.' },
  { what: 'Bike', why: 'fell once. that was enough.' },
  { what: 'Drive', why: 'no license. no plans.' },
  { what: 'Run', why: 'speed of vibes.' },
  { what: 'Cook', why: "can. shouldn't." },
  { what: 'Lie', why: 'shows on my face. always.' },
];

const ITEMS_KO = [
  { what: '수영', why: '물 좋아. 멀리서.' },
  { what: '자전거', why: '한 번 넘어졌어. 충분했어.' },
  { what: '운전', why: '면허 없음. 계획도 없음.' },
  { what: '달리기', why: '속도는 분위기로.' },
  { what: '요리', why: '할 수는 있어. 안 하는 게 나아.' },
  { what: '거짓말', why: '얼굴에 다 써짐. 매번.' },
];

export default function ThingsICantDo() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const items = isKo ? ITEMS_KO : ITEMS_EN;
  const intro = isKo ? '솔직하게 가자.' : "let's be honest.";
  const subline = isKo
    ? '내가 못 하는 것들이야. 의외로 리스트가 좀 길어.'
    : "things I just can't. the list is surprisingly long.";

  return (
    <Section>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <SectionEyebrow>03 / honest</SectionEyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <SectionTitle>{isKo ? '내가 못 하는 것들' : "Things I can't"}</SectionTitle>
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

        <ul
          style={{
            marginTop: 'clamp(36px, 5vh, 56px)',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {items.map((item, i) => (
            <CantItem key={item.what} {...item} index={i} />
          ))}
        </ul>
      </div>
    </Section>
  );
}

function CantItem({ what, why, index }: { what: string; why: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
        borderTop: '0.5px solid rgba(244,236,216,0.12)',
        padding: 'clamp(18px, 2.4vw, 32px) 0',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 24,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 5.6vw, 80px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--color-text)',
          opacity: 0.32,
          lineHeight: 1,
        }}
      >
        {what}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.1vw, 16px)',
          color: 'rgba(244,236,216,0.6)',
          letterSpacing: '0.01em',
          maxWidth: 280,
          textAlign: 'right',
          lineHeight: 1.45,
          flexShrink: 0,
        }}
      >
        {why}
      </span>
    </motion.li>
  );
}
