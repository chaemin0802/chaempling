import { getLocale } from 'next-intl/server';
import { getContactData } from '@/lib/content';
import { Section, SectionEyebrow, SectionTitle } from './section-utils';
import Reveal from './Reveal';

export default async function LetsTalk() {
  const contact = await getContactData();
  const locale = await getLocale();
  const isKo = locale === 'ko';

  const links: Array<{ label: string; href: string }> = [];
  if (contact.instagram) links.push({ label: 'instagram', href: contact.instagram });
  if (contact.behance) links.push({ label: 'behance', href: contact.behance });
  if (contact.linkedin) links.push({ label: 'linkedin', href: contact.linkedin });

  return (
    <Section id="talk">
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 240px)',
        }}
      >
        <Reveal>
          <SectionEyebrow>05 / inbox always open</SectionEyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <SectionTitle>{isKo ? '얘기하자' : "Let's talk"}</SectionTitle>
        </Reveal>

        <Reveal delay={0.16}>
          <p
            style={{
              marginTop: 22,
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(15px, 1.5vw, 20px)',
              lineHeight: 1.55,
              color: 'rgba(244,236,216,0.7)',
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              whiteSpace: 'pre-line',
            }}
          >
            {isKo
              ? '새 프로젝트, 이상한 아이디어, 잘하는 만두집 추천.\n뭐든 말 걸어줘.'
              : 'new project, weird idea, dumpling recommendation.\ntell me anything.'}
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <a
            href={`mailto:${contact.email}`}
            style={{
              display: 'inline-block',
              marginTop: 'clamp(32px, 5vh, 56px)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 2.4vw, 32px)',
              fontWeight: 600,
              color: 'var(--color-text)',
              borderBottom: '2px solid var(--color-text)',
              paddingBottom: 4,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {contact.email}
          </a>
        </Reveal>

        {links.length > 0 && (
          <Reveal delay={0.4}>
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 28,
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(244,236,216,0.55)',
              }}
            >
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ borderBottom: '0.5px solid rgba(244,236,216,0.3)', paddingBottom: 2 }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
