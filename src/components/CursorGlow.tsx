'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SIZE = 200;

export default function CursorGlow() {
  const mouseX = useMotionValue(-SIZE);
  const mouseY = useMotionValue(-SIZE);
  const x = useSpring(mouseX, { damping: 25, stiffness: 260, mass: 0.6 });
  const y = useSpring(mouseY, { damping: 25, stiffness: 260, mass: 0.6 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(hover: none)').matches) return;

    function onMove(e: MouseEvent) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        marginLeft: -SIZE / 2,
        marginTop: -SIZE / 2,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 60,
        mixBlendMode: 'plus-lighter',
        background:
          'radial-gradient(circle, rgba(255, 232, 180, 0.20) 0%, rgba(255, 232, 180, 0.08) 35%, rgba(255, 232, 180, 0) 70%)',
        filter: 'blur(6px)',
        x,
        y,
      }}
    />
  );
}
