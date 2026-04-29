import { getLocale } from 'next-intl/server';
import { Section, SectionEyebrow, SectionTitle } from './section-utils';
import Reveal from './Reveal';

export default async function OnAI() {
  const locale = await getLocale();
  const isKo = locale === 'ko';

  const lead = isKo ? '솔직히, AI 하기 싫었어.' : "real talk — I didn't want to do AI.";
  const punch = isKo
    ? '근데 지금? 한번 들어봐.'
    : 'and now? let me talk.';

  const paragraphs = isKo
    ? [
        '시작은 의도치 않았어. 한국 AI 콘텐츠 시장의 첫 출발점이었던 회사에 그래픽 디자인 인턴으로 들어갔는데, 들어가던 그 순간 그래픽 팀이 프롬프트 디자인팀으로 바뀌었어. 그게 내 AI 운명의 시작이었지.',
        '지금은 작년 기준 한국 AI 스타트업 중 매출 1위인 회사에서 프롬프트 디자이너로 일해. 이제는 콘텐츠만 만드는 게 아니라 어드민도 만들고, 반복 업무를 자동화하고, 더 많이 · 더 빨리 · 더 좋은 퀄리티로 뽑아내.',
        '내 영역이 더 이상 ‘디자이너’ 안에 갇혀 있지 않아. 바이브 코딩으로 개발도 하고, 나를 설명하는 이 포트폴리오도 직접 만들었어. 가장 못한다고 생각했던 영역에서, 내 가치를 계속 증명하고 있어.',
        '근데 다 좋은 건 아니야. 매너리즘에 빠지기도 하고, 정체성이 흔들리기도 하고, 나는 누구이며 무엇을 하는 사람인가에 대한 고민이 끊이질 않아.',
        '그래서 더 사람과의 대화, 연결이 중요하다고 생각해. 디자이너의 영역은 결국 얼마나 깊게 스스로 생각할 수 있느냐로 갈릴 거고. 그만큼 기본기, 더 많은 경험, 디자인을 언어처럼 자유롭게 쓰는 법을 계속 고민하고 있어.',
        'AI를 이렇게까지 활용하면서 내가 증명할 수 있는 건 — 세상의 흐름·변화·시련에 얼마나 빨리 적응하고 활용하는가. 그리고 AI에게 대체되지 않기 위해, 인간으로 어떻게 살 것인가를 매일 고민한다는 점.',
        '디자이너라는 정체성을 계속 지키려 해. 본질을 지키려 해. AI는 나를 대체할 수 없어 — 단지 내가 할 수 있는 영역이 넓어지고, 풍부해졌을 뿐이야. 그리고 난 그게 너무 즐거워.',
      ]
    : [
        "it started by accident. I joined the company that pioneered Korea's AI content market as a graphic design intern — and the week I walked in, the graphic team became the prompt design team. that was the beginning of my AI fate.",
        "now I'm a prompt designer at the highest-revenue AI startup in Korea (last year). I don't just make content — I build admin tools, automate the repetitive parts of my job, and ship more, faster, with better quality.",
        "my role isn't 'just designer' anymore. I vibe-code now. I built this portfolio that explains me. in the area I once thought I was worst at, I keep proving my value.",
        "it's not all clean. I hit walls of mannerism, my identity wobbles, and the question — who am I and what do I do — never really shuts up.",
        "that's why human conversation and connection matter more than ever. a designer's territory comes down to how deeply they can think on their own. so I keep coming back to fundamentals, to more experience, to using design as a language fluently.",
        "what I can prove, by leaning this hard into AI: how fast I read the current of the world, the changes, the shocks — and move with them. and that I think — every day — about how to stay human in this so AI doesn't replace me.",
        "I'm protecting my designer identity. I'm protecting what's essential. AI can't replace me — it just widened my range, made the work richer. and honestly, I'm so excited for where this goes.",
      ];

  return (
    <Section>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <Reveal>
          <SectionEyebrow>05 / on AI</SectionEyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <SectionTitle>
            {isKo ? 'AI, 너 누구야?  잠깐, 나는 누구지?' : 'AI, who are you?  wait — who am I?'}
          </SectionTitle>
        </Reveal>

        <Reveal delay={0.16}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 2.2vw, 28px)',
              fontWeight: 500,
              color: 'rgba(244,236,216,0.95)',
              marginTop: 28,
              letterSpacing: '0.005em',
              lineHeight: 1.4,
            }}
          >
            {lead}
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 2.2vw, 28px)',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginTop: 6,
              letterSpacing: '0.005em',
              lineHeight: 1.4,
            }}
          >
            {punch}
          </p>
        </Reveal>

        <div style={{ marginTop: 'clamp(36px, 5vh, 56px)' }}>
          {paragraphs.map((para, idx) => (
            <Reveal key={idx} delay={0.3 + idx * 0.06} y={14} duration={0.6}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 300,
                  fontSize: 'clamp(15px, 1.4vw, 19px)',
                  color: 'rgba(244,236,216,0.78)',
                  lineHeight: 1.7,
                  letterSpacing: '0.005em',
                  marginTop: idx === 0 ? 0 : 'clamp(16px, 2vh, 24px)',
                }}
              >
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
