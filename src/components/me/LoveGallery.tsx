'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Love } from '@/lib/types';

interface LoveGalleryProps {
  loves: Love[];
}

export default function LoveGallery({ loves }: LoveGalleryProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 'clamp(16px, 2vw, 28px)',
      }}
    >
      {loves.map((love, i) => (
        <LoveCard key={love.id} love={love} index={i} />
      ))}
    </div>
  );
}

function LoveCard({ love, index }: { love: Love; index: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: [0.22, 0.65, 0.3, 1] }}
      style={{ margin: 0 }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          background: 'rgba(244,236,216,0.04)',
          overflow: 'hidden',
        }}
      >
        {love.imageUrl ? (
          <Image
            src={love.imageUrl}
            alt={love.alt || love.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(244,236,216,0.3)',
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            image
          </div>
        )}
      </div>
      <figcaption style={{ marginTop: 14 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(18px, 1.5vw, 22px)',
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: 'var(--color-text)',
          }}
        >
          {love.title}
        </div>
        {love.tmi && (
          <div
            style={{
              marginTop: 4,
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 14,
              color: 'rgba(244,236,216,0.55)',
              lineHeight: 1.4,
            }}
          >
            {love.tmi}
          </div>
        )}
      </figcaption>
    </motion.figure>
  );
}
