import { getPayload } from 'payload';
import config from '@payload-config';
import type { Project, AboutData, ContactData, GalleryImage, City, Love } from './types';

// ---------- helpers ----------

async function payload() {
  return getPayload({ config });
}

function mediaUrl(media: unknown): string {
  if (!media || typeof media !== 'object') return '';
  const m = media as { url?: string };
  return m.url || '';
}

function mediaFull(media: unknown): GalleryImage | null {
  if (!media || typeof media !== 'object') return null;
  const m = media as { url?: string; width?: number; height?: number; alt?: string; mimeType?: string };
  if (!m.url) return null;
  return {
    url: m.url,
    width: m.width ?? 1600,
    height: m.height ?? 1200,
    alt: m.alt ?? '',
    mimeType: m.mimeType ?? 'image/jpeg',
  };
}

function galleryFrom(arr: unknown): GalleryImage[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => mediaFull(item))
    .filter((g): g is GalleryImage => !!g);
}

function toolNames(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((t) => {
      if (typeof t === 'string') return '';
      const obj = t as { name?: string };
      return obj?.name ?? '';
    })
    .filter((s): s is string => !!s);
}

// ---------- fallbacks (used when DB is empty / not migrated yet) ----------

const fallbackProjects: Project[] = [
  {
    id: '1', title: 'Orbit Identity System', titleKr: '오빗 아이덴티티 시스템',
    slug: 'orbit-identity', category: 'Branding', year: 2024,
    tools: ['Illustrator', 'Figma', 'After Effects'], coverUrl: '/samples/cover-1.svg',
    descriptionEn: 'A comprehensive brand identity system for Orbit.',
    descriptionKr: '우주 기술 스타트업 Orbit을 위한 종합 브랜드 아이덴티티 시스템.',
    coverMimeType: 'image/svg+xml', coverWidth: 800, coverHeight: 600, homeCoverUrl: '/samples/cover-1.svg', homeCoverMimeType: 'image/svg+xml', homeCoverWidth: 800, homeCoverHeight: 600, published: true, images: ['/samples/cover-1.svg'], gallery: [], blocks: [],
  },
  {
    id: '2', title: 'AI Dreamscape', titleKr: 'AI 드림스케이프',
    slug: 'ai-dreamscape', category: 'AI Art', year: 2024,
    tools: ['Midjourney', 'Photoshop'], coverUrl: '/samples/cover-2.svg',
    descriptionEn: 'An experimental AI-generated landscape series.',
    descriptionKr: 'AI로 생성한 초현실적 풍경을 탐구하는 실험적 시리즈.',
    coverMimeType: 'image/svg+xml', coverWidth: 800, coverHeight: 600, homeCoverUrl: '/samples/cover-2.svg', homeCoverMimeType: 'image/svg+xml', homeCoverWidth: 800, homeCoverHeight: 600, published: true, images: ['/samples/cover-2.svg'], gallery: [], blocks: [],
  },
  {
    id: '3', title: 'Editorial Spreads', titleKr: '에디토리얼 스프레드',
    slug: 'editorial-spreads', category: 'Print', year: 2023,
    tools: ['InDesign', 'Photoshop'], coverUrl: '/samples/cover-3.svg',
    descriptionEn: 'Editorial spread designs for independent magazines.',
    descriptionKr: '독립 예술·문화 잡지를 위한 에디토리얼 스프레드 디자인.',
    coverMimeType: 'image/svg+xml', coverWidth: 800, coverHeight: 600, homeCoverUrl: '/samples/cover-3.svg', homeCoverMimeType: 'image/svg+xml', homeCoverWidth: 800, homeCoverHeight: 600, published: true, images: ['/samples/cover-3.svg'], gallery: [], blocks: [],
  },
];

const fallbackAbout: AboutData = {
  name: 'Chaempling',
  role: 'Graphic & AI Designer',
  bioEn: 'Creative designer exploring the intersection of traditional graphic design and AI-generated art.',
  bioKr: '전통 그래픽 디자인과 AI 아트의 교차점을 탐구하는 크리에이티브 디자이너.',
  photoUrl: '/samples/portrait.svg',
  email: 'hello@chaempling.com',
  instagram: 'https://instagram.com/chaempling',
  behance: 'https://behance.net/chaempling',
  linkedin: 'https://linkedin.com/in/chaempling',
  experience: [],
  education: [],
  tools: [],
};

const fallbackContact: ContactData = {
  email: 'hello@chaempling.com',
  instagram: 'https://instagram.com/chaempling',
  behance: 'https://behance.net/chaempling',
  linkedin: 'https://linkedin.com/in/chaempling',
  headingEn: "Let's work together.",
  headingKr: '함께 작업해요.',
  subtextEn: "Have a project in mind? I'd love to hear about it.",
  subtextKr: '프로젝트가 있으신가요? 이야기를 듣고 싶습니다.',
};

// ---------- Work ----------

function docToProject(doc: Record<string, unknown>): Project {
  const tools = toolNames(doc.tools);
  const gallery = galleryFrom(doc.gallery);
  const coverMedia = mediaFull(doc.cover);
  const homeCoverMedia = mediaFull(doc.homeCover);
  // cover fallback chain: cover → first gallery item
  const cover = coverMedia ?? gallery[0] ?? null;
  // home cover fallback chain: homeCover → cover → first gallery item
  const homeCover = homeCoverMedia ?? cover;
  return {
    id: String(doc.id),
    title: (doc.title as string) || '',
    titleKr: (doc.titleKr as string) || '',
    slug: (doc.slug as string) || '',
    category: (doc.category as string) || '',
    year: (doc.year as number) || new Date().getFullYear(),
    tools,
    coverUrl: cover?.url ?? '',
    coverMimeType: cover?.mimeType ?? '',
    coverWidth: cover?.width ?? 0,
    coverHeight: cover?.height ?? 0,
    homeCoverUrl: homeCover?.url ?? '',
    homeCoverMimeType: homeCover?.mimeType ?? '',
    homeCoverWidth: homeCover?.width ?? 0,
    homeCoverHeight: homeCover?.height ?? 0,
    descriptionEn: (doc.descriptionEn as string) || '',
    descriptionKr: (doc.descriptionKr as string) || '',
    published: (doc.published as boolean) ?? true,
    images: cover?.url ? [cover.url] : [],
    gallery,
    blocks: [],
  };
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const p = await payload();
    const { docs } = await p.find({
      collection: 'work',
      where: { published: { equals: true } },
      sort: ['order', '-year'],
      depth: 1,
      limit: 100,
    });
    if (docs.length === 0) return fallbackProjects;
    return docs.map((d) => docToProject(d as Record<string, unknown>));
  } catch (err) {
    console.error('[content] getPublishedProjects failed:', err);
    return fallbackProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const p = await payload();
    const { docs } = await p.find({
      collection: 'work',
      where: {
        and: [{ slug: { equals: slug } }, { published: { equals: true } }],
      },
      depth: 1,
      limit: 1,
    });
    if (docs.length === 0) {
      return fallbackProjects.find((p) => p.slug === slug) ?? null;
    }
    return docToProject(docs[0] as Record<string, unknown>);
  } catch (err) {
    console.error('[content] getProjectBySlug failed:', err);
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  }
}

// ---------- About ----------

export async function getAboutData(): Promise<AboutData> {
  try {
    const p = await payload();
    const data = (await p.findGlobal({ slug: 'about', depth: 1 })) as Record<string, unknown>;
    if (!data || Object.keys(data).length === 0) return fallbackAbout;

    return {
      name: (data.name as string) || fallbackAbout.name,
      role: (data.role as string) || fallbackAbout.role,
      bioEn: (data.bioEn as string) || fallbackAbout.bioEn,
      bioKr: (data.bioKr as string) || fallbackAbout.bioKr,
      photoUrl: mediaUrl(data.photo) || fallbackAbout.photoUrl,
      email: (data.email as string) || fallbackAbout.email,
      instagram: (data.instagram as string) || fallbackAbout.instagram,
      behance: (data.behance as string) || fallbackAbout.behance,
      linkedin: (data.linkedin as string) || fallbackAbout.linkedin,
      experience: (data.experience as AboutData['experience']) || [],
      education: (data.education as AboutData['education']) || [],
      tools: toolNames(data.tools),
    };
  } catch (err) {
    console.error('[content] getAboutData failed:', err);
    return fallbackAbout;
  }
}

// ---------- Cities ----------

const fallbackCities: City[] = [
  { id: 'fb-madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { id: 'fb-seoul', name: 'Seoul', country: 'Korea', lat: 37.5665, lng: 126.978, note: 'My Home!' },
];

export async function getCities(): Promise<City[]> {
  try {
    const p = await payload();
    const { docs } = await p.find({
      collection: 'cities',
      limit: 200,
      sort: 'name',
    });
    if (docs.length === 0) return fallbackCities;
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      return {
        id: String(doc.id),
        name: (doc.name as string) || '',
        country: (doc.country as string) || '',
        lat: (doc.lat as number) || 0,
        lng: (doc.lng as number) || 0,
        note: (doc.note as string) || undefined,
      };
    });
  } catch (err) {
    console.error('[content] getCities failed:', err);
    return fallbackCities;
  }
}

// ---------- Loves ----------

const fallbackLoves: Love[] = [
  { id: 'fb-1', title: 'Dumplings', tmi: 'the only food that makes me cry happy.', imageUrl: '', imageWidth: 0, imageHeight: 0, alt: '' },
  { id: 'fb-2', title: 'Dancing', tmi: "till 6am, if anyone's still standing.", imageUrl: '', imageWidth: 0, imageHeight: 0, alt: '' },
  { id: 'fb-3', title: '16h sleep', tmi: 'easy. just close my eyes.', imageUrl: '', imageWidth: 0, imageHeight: 0, alt: '' },
  { id: 'fb-4', title: 'Pottery', tmi: 'two months in. already obsessed.', imageUrl: '', imageWidth: 0, imageHeight: 0, alt: '' },
  { id: 'fb-5', title: 'Classics', tmi: 'tolstoy. before bed. romantic.', imageUrl: '', imageWidth: 0, imageHeight: 0, alt: '' },
  { id: 'fb-6', title: 'Claude', tmi: 'we hang out. it knows me.', imageUrl: '', imageWidth: 0, imageHeight: 0, alt: '' },
];

export async function getLoves(): Promise<Love[]> {
  try {
    const p = await payload();
    const { docs } = await p.find({
      collection: 'loves',
      limit: 100,
      sort: 'order',
      depth: 1,
    });
    if (docs.length === 0) return fallbackLoves;
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      const img = mediaFull(doc.image);
      return {
        id: String(doc.id),
        title: (doc.title as string) || '',
        tmi: (doc.tmi as string) || '',
        imageUrl: img?.url ?? '',
        imageWidth: img?.width ?? 0,
        imageHeight: img?.height ?? 0,
        alt: img?.alt ?? '',
      };
    });
  } catch (err) {
    console.error('[content] getLoves failed:', err);
    return fallbackLoves;
  }
}

// ---------- Contact ----------

export async function getContactData(): Promise<ContactData> {
  try {
    const p = await payload();
    const data = (await p.findGlobal({ slug: 'contact' })) as Record<string, unknown>;
    if (!data || Object.keys(data).length === 0) return fallbackContact;

    return {
      email: ((data.email as string) || fallbackContact.email).replace(/^mailto:/, ''),
      instagram: (data.instagram as string) || fallbackContact.instagram,
      behance: (data.behance as string) || fallbackContact.behance,
      linkedin: (data.linkedin as string) || fallbackContact.linkedin,
      headingEn: (data.headingEn as string) || fallbackContact.headingEn,
      headingKr: (data.headingKr as string) || fallbackContact.headingKr,
      subtextEn: (data.subtextEn as string) || fallbackContact.subtextEn,
      subtextKr: (data.subtextKr as string) || fallbackContact.subtextKr,
    };
  } catch (err) {
    console.error('[content] getContactData failed:', err);
    return fallbackContact;
  }
}
