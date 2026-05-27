import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectBySlug, getPublishedProjects } from '@/lib/content';
import { getTranslations } from 'next-intl/server';
import MuteToggleVideo from '@/components/MuteToggleVideo';

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('work');

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await getPublishedProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  const title =
    locale === 'ko' && project.titleKr ? project.titleKr : project.title;
  const description =
    locale === 'ko' && project.descriptionKr
      ? project.descriptionKr
      : project.descriptionEn;

  return (
    <div className="min-h-screen" style={{ paddingTop: 46 }}>
      {/* Top navigation */}
      <div
        className="flex items-center justify-between py-4"
        style={{ padding: '16px clamp(24px, 4vw, 60px)', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}
      >
        <Link
          href={`/${locale}/work`}
          className="text-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          &larr; {t('back')}
        </Link>
        <div className="flex gap-4 text-sm">
          {prevProject && (
            <Link
              href={`/${locale}/work/${prevProject.slug}`}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              {t('prev')}
            </Link>
          )}
          {nextProject && (
            <Link
              href={`/${locale}/work/${nextProject.slug}`}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              {t('next')}
            </Link>
          )}
        </div>
      </div>

      {/* Cover */}
      <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
        {project.coverUrl ? (
          project.coverMimeType.startsWith('video/') ? (
            <MuteToggleVideo src={project.coverUrl} fill />
          ) : (
            <Image
              src={project.coverUrl}
              alt={title}
              fill
              unoptimized={project.coverMimeType === 'image/gif' || project.coverMimeType === 'image/webp'}
              className="object-cover"
              style={{ borderRadius: 0 }}
              priority
            />
          )
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(220, 20%, 16%)' }}
          >
            <span className="text-lg opacity-20">{title}</span>
          </div>
        )}
      </div>

      {/* Project info */}
      <div className="py-8 max-w-3xl" style={{ padding: '32px clamp(24px, 4vw, 60px)' }}>
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {project.category} · {project.year}
        </p>
        <h1 className="text-2xl font-semibold mb-3">{title}</h1>

        {description && (
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {description}
          </p>
        )}

        {project.tools.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="text-xs px-3 py-1"
                style={{
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 0,
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gallery — full-width images/videos stacked tight, no gap */}
      {project.gallery.length > 0 && (
        <div className="w-full">
          {project.gallery.map((item, i) =>
            item.mimeType.startsWith('video/') ? (
              <MuteToggleVideo key={i} src={item.url} />
            ) : (
              <Image
                key={i}
                src={item.url}
                alt={item.alt || `${title} — ${i + 1}`}
                width={item.width}
                height={item.height}
                sizes="100vw"
                unoptimized={item.mimeType === 'image/gif' || item.mimeType === 'image/webp'}
                className="block w-full h-auto"
                style={{ display: 'block' }}
                priority={i === 0}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
