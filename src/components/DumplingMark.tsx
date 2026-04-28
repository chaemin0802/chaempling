'use client';

import { motion, type MotionValue } from 'framer-motion';

interface DumplingMarkProps {
  size?: number | MotionValue<number>;
  opacity?: number | MotionValue<number>;
  rotation?: number;
  className?: string;
}

/**
 * Hand-drawn 2D dumpling — riso style. Cream + terracotta strokes.
 * Sized via prop; pairs with display type as an accent.
 */
export default function DumplingMark({
  size = 64,
  opacity = 1,
  rotation = -8,
  className,
}: DumplingMarkProps) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      style={{
        width: size as number,
        height: size as number,
        opacity: opacity as number,
        transform: `rotate(${rotation}deg)`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Body */}
      <path
        d="M14 60 Q14 40 50 38 Q86 40 86 60 Q86 76 50 76 Q14 76 14 60 Z"
        fill="#E8B4A0"
        stroke="#0a0908"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Pleats */}
      <path d="M28 58 Q30 44 38 42" stroke="#0a0908" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40 56 Q42 40 50 38" stroke="#0a0908" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M52 56 Q56 40 64 42" stroke="#0a0908" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M64 58 Q70 44 74 46" stroke="#0a0908" strokeWidth="1.6" strokeLinecap="round" />
      {/* Bottom shine */}
      <path
        d="M22 66 Q50 72 78 66"
        stroke="#D96E4D"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </motion.svg>
  );
}
