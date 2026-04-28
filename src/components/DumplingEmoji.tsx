'use client';

import { motion, type MotionValue } from 'framer-motion';

interface DumplingEmojiProps {
  size: MotionValue<number>;
  opacity: MotionValue<number>;
}

export default function DumplingEmoji({ size, opacity }: DumplingEmojiProps) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        opacity,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.span
        style={{ fontSize: size, lineHeight: 1 }}
      >
        🥟
      </motion.span>
    </motion.div>
  );
}
