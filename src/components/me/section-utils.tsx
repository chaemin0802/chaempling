import type { CSSProperties, ReactNode } from 'react';

interface SectionProps {
  id?: string;
  children: ReactNode;
  background?: string;
  style?: CSSProperties;
  minHeight?: string;
}

export function Section({ id, children, background, style, minHeight = '100vh' }: SectionProps) {
  return (
    <section
      id={id}
      className="snap-start"
      style={{
        position: 'relative',
        minHeight,
        backgroundColor: background ?? 'var(--color-bg)',
        padding: 'clamp(60px, 10vh, 120px) clamp(24px, 5vw, 80px)',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function SectionTitle({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(40px, 7vw, 96px)',
        lineHeight: 0.95,
        fontWeight: 700,
        letterSpacing: '-0.035em',
        color: color ?? 'var(--color-text)',
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

export function SectionEyebrow({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(11px, 0.9vw, 13px)',
        fontWeight: 500,
        color: color ?? 'rgba(244,236,216,0.5)',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        marginBottom: 18,
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  );
}
