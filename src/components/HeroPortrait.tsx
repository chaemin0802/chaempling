'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import Image from 'next/image';

interface HeroPortraitProps {
  size?: number;
  opacity?: MotionValue<number>;
  scale?: MotionValue<number>;
  onClick?: () => void;
}

export default function HeroPortrait({ size = 360, opacity, scale, onClick }: HeroPortraitProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 90, damping: 18, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 18, mass: 0.6 });

  const rotateZ = useTransform(springX, [-1, 1], [-6, 6]);
  const rotateY = useTransform(springX, [-1, 1], [-12, 12]);
  const rotateX = useTransform(springY, [-1, 1], [8, -8]);
  const translateX = useTransform(springX, [-1, 1], [-14, 14]);
  const translateY = useTransform(springY, [-1, 1], [-10, 10]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      mouseX.set(Math.max(-1, Math.min(1, dx)));
      mouseY.set(Math.max(-1, Math.min(1, dy)));
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.04 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        position: 'relative',
        width: size,
        height: size,
        opacity,
        scale,
        perspective: 800,
        willChange: 'transform',
        cursor: onClick ? 'pointer' : 'default',
        pointerEvents: onClick ? 'auto' : 'none',
      }}
    >
      <motion.div
        animate={mounted ? { y: [0, -12, 0] } : {}}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            x: translateX,
            y: translateY,
            rotateX,
            rotateY,
            rotateZ,
            transformStyle: 'preserve-3d',
          }}
        >
          <Image
            src="/jayla.png"
            alt="Jayla"
            width={size}
            height={size}
            priority
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
