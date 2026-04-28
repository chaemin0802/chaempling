import { getPublishedProjects } from '@/lib/content';
import { getTranslations } from 'next-intl/server';
import WorkGrid from '@/components/WorkGrid';

export const revalidate = 60;

export default async function WorkPage() {
  const projects = await getPublishedProjects();
  const t = await getTranslations('work');

  return (
    <div className="min-h-screen" style={{ paddingTop: 46 }}>
      <div className="flex items-center justify-between py-5" style={{ padding: '20px clamp(24px, 4vw, 60px)' }}>
        <h1 className="text-sm font-semibold tracking-widest">{t('title')}</h1>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {projects.length} {t('projects')}
        </span>
      </div>
      <div style={{ padding: '0 clamp(24px, 4vw, 60px) clamp(40px, 6vw, 80px)' }}>
        <WorkGrid projects={projects} />
      </div>
    </div>
  );
}
