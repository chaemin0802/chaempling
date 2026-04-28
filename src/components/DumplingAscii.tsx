'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, type MotionValue } from 'framer-motion';

// Dumpling ASCII art — half-moon with pleated top edge + rising steam
const BASE_ART = [
  '  ✦          ~    ~    ~          .  ',
  '      .       ~  ~   ~       ✧      ',
  '               ~  ~  ~              ',
  '         _/\\_/\\_/\\_/\\_/\\_       ',
  '   .   /                    \\   .   ',
  '      /                      \\      ',
  '     |                        |     ',
  '      \\                      /      ',
  '  ✧    \\____________________/   .   ',
  '      .          ✦          ✧       ',
];

const SPARKLE_CHARS = ['✦', '✧', '·', '˚', '*', '⋆', '✦'];
const STEAM_CHARS = ['~', '∼', '˜', '~'];

interface DumplingAsciiProps {
  size: MotionValue<number>;
  opacity: MotionValue<number>;
}

export default function DumplingAscii({ size, opacity }: DumplingAsciiProps) {
  const [art, setArt] = useState(BASE_ART);

  const twinkle = useCallback(() => {
    setArt((prev) =>
      prev.map((line) =>
        line
          .split('')
          .map((ch) => {
            if (['✦', '✧', '·', '˚', '*', '⋆'].includes(ch)) {
              // 15% chance to change to another sparkle char
              if (Math.random() < 0.15) {
                return SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
              }
            }
            if (ch === '.' && Math.random() < 0.08) {
              return ['·', '˚', '✧'][Math.floor(Math.random() * 3)];
            }
            if (['·', '˚'].includes(ch) && Math.random() < 0.08) {
              return '.';
            }
            // Steam gently shifts
            if (['~', '∼', '˜'].includes(ch) && Math.random() < 0.12) {
              return STEAM_CHARS[Math.floor(Math.random() * STEAM_CHARS.length)];
            }
            return ch;
          })
          .join('')
      )
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(twinkle, 600);
    return () => clearInterval(interval);
  }, [twinkle]);

  return (
    <motion.div
      style={{
        opacity,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.pre
        style={{
          fontSize: size,
          lineHeight: 1.3,
          fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          color: '#f0ede6',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {art.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>
            {line.split('').map((ch, j) => {
              const isSparkle = ['✦', '✧', '·', '˚', '*', '⋆'].includes(ch);
              const isSteam = ['~', '∼', '˜'].includes(ch);
              if (isSparkle) {
                return (
                  <motion.span
                    key={`${i}-${j}`}
                    animate={{
                      opacity: [0.2, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                      ease: 'easeInOut',
                    }}
                    style={{ color: 'rgba(240, 237, 230, 0.6)' }}
                  >
                    {ch}
                  </motion.span>
                );
              }
              if (isSteam) {
                return (
                  <motion.span
                    key={`${i}-${j}`}
                    animate={{
                      opacity: [0.15, 0.45, 0.15],
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: 'easeInOut',
                    }}
                    style={{
                      color: 'rgba(240, 237, 230, 0.4)',
                      display: 'inline-block',
                    }}
                  >
                    {ch}
                  </motion.span>
                );
              }
              return (
                <span key={`${i}-${j}`} style={{ opacity: ch === ' ' ? 0 : 0.85 }}>
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </motion.pre>
    </motion.div>
  );
}
