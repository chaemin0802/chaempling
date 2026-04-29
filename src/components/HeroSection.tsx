'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import HeroPortrait from './HeroPortrait';

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const router = useRouter();
  const [portraitHovered, setPortraitHovered] = useState(false);

  const scrollDown = () => {
    const target = document.getElementById('home-work');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{
        position: 'relative',
        height: 'calc(100vh - 46px)',
        marginTop: 46,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 2,
          pointerEvents: 'none',
          padding: '0 24px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 10vw, 156px)',
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--color-text)',
            margin: 0,
            transform: 'translateY(-85%)',
          }}
        >
          <span style={{ display: 'block', transform: 'translateY(-6%)' }}>Always a beginner,</span>
          <span style={{ display: 'block' }}>Already in the game.</span>
        </h1>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <div
          onMouseEnter={() => setPortraitHovered(true)}
          onMouseLeave={() => setPortraitHovered(false)}
          style={{ position: 'relative', pointerEvents: 'auto' }}
        >
          <HeroPortrait size={420} onClick={() => router.push(`/${locale}/about`)} />
          <AnimatePresence>
            {portraitHovered && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '76%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(244,236,216,0.45)',
                  textAlign: 'left',
                  pointerEvents: 'none',
                  lineHeight: 1.35,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 400 }}>if you&apos;re</div>
                <div style={{ fontSize: 10, fontWeight: 400 }}>curious about me</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>click!</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollDown}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 40,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
        }}
        aria-label="View work"
      >
        <div
          style={{
            fontSize: 12,
            color: 'rgba(244, 236, 216, 0.75)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          if you&apos;re curious about my work
        </div>
        <div
          style={{
            fontSize: 15,
            color: 'var(--color-text)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          scroll!
        </div>
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 16, color: 'rgba(244, 236, 216, 0.7)', marginTop: 4 }}
        >
          ↓
        </motion.span>
      </button>
    </div>
  );
}
