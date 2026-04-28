'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import type { Project } from '@/lib/types';

interface WorkGridProps {
  projects: Project[];
}

export default function WorkGrid({ projects }: WorkGridProps) {
  const locale = useLocale();

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'clamp(16px, 2vw, 28px)',
        alignItems: 'start',
      }}
    >
      {projects.map((project, i) => {
        const isFirst = i === 0;
        const title = locale === 'ko' && project.titleKr ? project.titleKr : project.title;

        const fallbackRatio = isFirst ? '16/9' : i % 3 === 0 ? '3/4' : '4/3';
        const isVideo = project.coverMimeType.startsWith('video/');

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{
              duration: 0.55,
              delay: Math.min(i * 0.06, 0.3),
              ease: [0.22, 0.65, 0.3, 1],
            }}
            style={{ gridColumn: isFirst ? 'span 2' : 'span 1' }}
          >
          <Link
            href={`/${locale}/work/${project.slug}`}
            className="group block"
          >
            <div
              className="relative overflow-hidden w-full"
              style={{ backgroundColor: '#111' }}
            >
              {project.coverUrl ? (
                isVideo ? (
                  <video
                    src={project.coverUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
                    style={{ display: 'block' }}
                  />
                ) : project.coverWidth && project.coverHeight ? (
                  <Image
                    src={project.coverUrl}
                    alt={title}
                    width={project.coverWidth}
                    height={project.coverHeight}
                    sizes={isFirst ? '(max-width: 768px) 100vw, 67vw' : '(max-width: 768px) 50vw, 33vw'}
                    quality={90}
                    unoptimized={project.coverMimeType === 'image/gif' || project.coverMimeType === 'image/webp'}
                    className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
                    style={{ borderRadius: 0 }}
                  />
                ) : (
                  <div className="relative w-full" style={{ aspectRatio: fallbackRatio }}>
                    <Image
                      src={project.coverUrl}
                      alt={title}
                      fill
                      sizes={isFirst ? '(max-width: 768px) 100vw, 67vw' : '(max-width: 768px) 50vw, 33vw'}
                      quality={90}
                      unoptimized={project.coverMimeType === 'image/gif' || project.coverMimeType === 'image/webp'}
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                )
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  style={{
                    aspectRatio: fallbackRatio,
                    backgroundColor: `hsl(${(i * 47 + 200) % 360}, 20%, ${16 + (i % 4) * 2}%)`,
                  }}
                >
                  <span className="text-sm opacity-30">{title}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 4px 4px' }}>
              <p className="font-medium" style={{ fontSize: 13 }}>
                {title}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                {project.category} · {project.year}
              </p>
            </div>
          </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
