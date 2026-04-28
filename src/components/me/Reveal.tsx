'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  /** how far it slides from. default -24 (left). use 0 for fade-only. */
  x?: number;
  y?: number;
  duration?: number;
}

export default function Reveal({
  children,
  delay = 0,
  x = -24,
  y = 0,
  duration = 0.5,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.22, 0.65, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
