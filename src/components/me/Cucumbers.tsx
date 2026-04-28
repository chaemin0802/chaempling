'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Section, SectionEyebrow } from './section-utils';
import Reveal from './Reveal';

export default function Cucumbers() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const lead = isKo
    ? '잠깐만, 이건 정말 중요한 얘기.'
    : 'wait — actually, this one matters.';
  const titleTop = isKo ? '제발.' : 'Please.';
  const titleBot = isKo ? '진심으로.' : 'Never.';
  const tail = isKo
    ? '오이 닿은 음식은 안 먹어. 시험하지 마. 예외 없음.'
    : "if it's touched cucumber, I haven't. don't test me. no exceptions.";

  return (
    <Section>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 240px)',
        }}
      >
        <Reveal>
          <SectionEyebrow>04 / disclaimer</SectionEyebrow>
        </Reveal>

        <Reveal delay={0.08}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(17px, 1.6vw, 22px)',
              color: 'rgba(244,236,216,0.85)',
              marginTop: 14,
              letterSpacing: '0.01em',
            }}
          >
            {lead}
          </p>
        </Reveal>

        <motion.div
          initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ type: 'spring', stiffness: 130, damping: 12, delay: 0.16 }}
          style={{
            position: 'relative',
            fontSize: 'clamp(110px, 18vw, 220px)',
            lineHeight: 1,
            marginTop: 'clamp(28px, 5vh, 56px)',
            marginBottom: 16,
          }}
        >
          <span style={{ filter: 'blur(9px)', display: 'inline-block' }}>🥒</span>
        </motion.div>

        <Reveal delay={0.32} duration={0.6}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(60px, 11vw, 180px)',
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {titleTop}
            <br />
            {titleBot}
          </h2>
        </Reveal>

        <Reveal delay={0.48}>
          <p
            style={{
              marginTop: 28,
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(14px, 1.3vw, 17px)',
              color: 'rgba(244,236,216,0.6)',
              maxWidth: 460,
              lineHeight: 1.5,
            }}
          >
            {tail}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
