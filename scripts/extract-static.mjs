// Extract all Payload data + referenced media into static JSON + /public/media
// Run: node scripts/extract-static.mjs

import Database from 'better-sqlite3';
import {
  writeFileSync,
  copyFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dbPath = path.join(root, 'payload.db');
const outDir = path.join(root, 'src/data');
const R2_PUBLIC = 'https://pub-377fea399d6d4161a5ce1c307767b726.r2.dev';

mkdirSync(outDir, { recursive: true });

const db = new Database(dbPath, { readonly: true });

// Build media lookup: id → { filename, url (rewritten), width, height, alt, mimeType }
const allMedia = new Map();
for (const row of db
  .prepare(
    'SELECT id, filename, alt, mime_type, width, height FROM media',
  )
  .all()) {
  if (!row.filename) continue;
  allMedia.set(row.id, {
    filename: row.filename,
    url: '/media/' + row.filename,
    width: Number(row.width) || 1600,
    height: Number(row.height) || 1200,
    alt: row.alt || '',
    mimeType: row.mime_type || 'image/jpeg',
  });
}

const referenced = new Set();
function pickMedia(id) {
  if (!id) return null;
  const m = allMedia.get(id);
  if (!m) return null;
  referenced.add(id);
  return m;
}

// ---------- Works ----------
const works = db
  .prepare(
    'SELECT * FROM work WHERE published = 1 ORDER BY "order" ASC, year DESC',
  )
  .all();

const projects = works.map((w) => {
  const cover = pickMedia(w.cover_id);
  const homeCover = pickMedia(w.home_cover_id);
  const galleryRows = db
    .prepare(
      `SELECT media_id FROM work_rels
       WHERE parent_id = ? AND path = 'gallery' AND media_id IS NOT NULL
       ORDER BY "order" ASC`,
    )
    .all(w.id);
  const gallery = galleryRows
    .map((r) => pickMedia(r.media_id))
    .filter(Boolean);

  const toolRows = db
    .prepare(
      `SELECT t.name FROM work_rels wr
       JOIN tools t ON wr.tools_id = t.id
       WHERE wr.parent_id = ? AND wr.path = 'tools'
       ORDER BY wr."order" ASC`,
    )
    .all(w.id);
  const tools = toolRows.map((r) => r.name).filter(Boolean);

  const useCover = cover ?? gallery[0] ?? null;
  const useHomeCover = homeCover ?? useCover;

  return {
    id: String(w.id),
    title: w.title || '',
    titleKr: w.title_kr || '',
    slug: w.slug || '',
    category: w.category || '',
    year: Number(w.year) || new Date().getFullYear(),
    tools,
    coverUrl: useCover?.url ?? '',
    coverMimeType: useCover?.mimeType ?? '',
    coverWidth: useCover?.width ?? 0,
    coverHeight: useCover?.height ?? 0,
    homeCoverUrl: useHomeCover?.url ?? '',
    homeCoverMimeType: useHomeCover?.mimeType ?? '',
    homeCoverWidth: useHomeCover?.width ?? 0,
    homeCoverHeight: useHomeCover?.height ?? 0,
    descriptionEn: w.description_en || '',
    descriptionKr: w.description_kr || '',
    published: !!w.published,
    images: useCover?.url ? [useCover.url] : [],
    gallery,
    blocks: [],
  };
});
writeFileSync(
  path.join(outDir, 'projects.json'),
  JSON.stringify(projects, null, 2),
);

// ---------- Loves ----------
const lovesRows = db
  .prepare('SELECT * FROM loves ORDER BY "order" ASC, id ASC')
  .all();
const loves = lovesRows.map((l) => {
  const img = pickMedia(l.image_id);
  return {
    id: String(l.id),
    title: l.title || '',
    tmi: l.tmi || '',
    imageUrl: img?.url ?? '',
    imageWidth: img?.width ?? 0,
    imageHeight: img?.height ?? 0,
    alt: img?.alt ?? '',
  };
});
writeFileSync(
  path.join(outDir, 'loves.json'),
  JSON.stringify(loves, null, 2),
);

// ---------- Cities ----------
const citiesRows = db
  .prepare('SELECT * FROM cities ORDER BY name')
  .all();
const cities = citiesRows.map((c) => ({
  id: String(c.id),
  name: c.name || '',
  country: c.country || '',
  lat: Number(c.lat) || 0,
  lng: Number(c.lng) || 0,
  ...(c.note ? { note: c.note } : {}),
}));
writeFileSync(
  path.join(outDir, 'cities.json'),
  JSON.stringify(cities, null, 2),
);

// ---------- About (global) ----------
const aboutRow = db.prepare('SELECT * FROM about LIMIT 1').get();
let about = {
  name: '',
  role: '',
  bioEn: '',
  bioKr: '',
  photoUrl: '',
  email: '',
  instagram: '',
  behance: '',
  linkedin: '',
  experience: [],
  education: [],
  tools: [],
};
if (aboutRow) {
  const photo = pickMedia(aboutRow.photo_id);
  about = {
    name: aboutRow.name || '',
    role: aboutRow.role || '',
    bioEn: aboutRow.bio_en || '',
    bioKr: aboutRow.bio_kr || '',
    photoUrl: photo?.url || '',
    email: aboutRow.email || '',
    instagram: aboutRow.instagram || '',
    behance: aboutRow.behance || '',
    linkedin: aboutRow.linkedin || '',
    experience: [],
    education: [],
    tools: [],
  };
}
writeFileSync(
  path.join(outDir, 'about.json'),
  JSON.stringify(about, null, 2),
);

// ---------- Contact (global) ----------
const contactRow = db.prepare('SELECT * FROM contact LIMIT 1').get();
const contact = contactRow
  ? {
      email: (contactRow.email || '').replace(/^mailto:/, ''),
      instagram: contactRow.instagram || '',
      behance: contactRow.behance || '',
      linkedin: contactRow.linkedin || '',
      headingEn: contactRow.heading_en || '',
      headingKr: contactRow.heading_kr || '',
      subtextEn: contactRow.subtext_en || '',
      subtextKr: contactRow.subtext_kr || '',
    }
  : {
      email: '',
      instagram: '',
      behance: '',
      linkedin: '',
      headingEn: '',
      headingKr: '',
      subtextEn: '',
      subtextKr: '',
    };
writeFileSync(
  path.join(outDir, 'contact.json'),
  JSON.stringify(contact, null, 2),
);

// ---------- Copy referenced media files ----------
let copied = 0;
const missing = [];
const localFiles = existsSync(mediaSrc) ? new Set(readdirSync(mediaSrc)) : new Set();
for (const id of referenced) {
  const m = allMedia.get(id);
  if (!m) continue;
  if (localFiles.has(m.filename)) {
    copyFileSync(
      path.join(mediaSrc, m.filename),
      path.join(mediaDst, m.filename),
    );
    copied++;
  } else {
    missing.push(m.filename);
  }
}

console.log('==== EXTRACTION DONE ====');
console.log({
  projects: projects.length,
  loves: loves.length,
  cities: cities.length,
  referencedMedia: referenced.size,
  mediaCopied: copied,
  mediaMissing: missing.length,
});
if (missing.length) {
  console.log('\nMissing files (referenced by DB but not in /media):');
  for (const f of missing.slice(0, 20)) console.log('  -', f);
  if (missing.length > 20) console.log(`  ... and ${missing.length - 20} more`);
}

db.close();
