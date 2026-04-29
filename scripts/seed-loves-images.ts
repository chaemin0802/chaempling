/**
 * Seeds the Loves gallery with placeholder images on R2 + DB linkages.
 * Run with: npm run seed:loves
 *
 * Source images are fetched from Lorem Picsum with deterministic seeds so each
 * Loves item gets a stable photo. Replace any of these later via /admin.
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const required = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`✖ missing env: ${key}`);
    process.exit(1);
  }
}

interface Mapping {
  title: string;
  key: string;
  picsumSeed: string;
  width: number;
  height: number;
}

const MAPPING: Mapping[] = [
  { title: 'Coffee',    key: 'love-coffee.jpg',    picsumSeed: 'coffeebrew', width: 1200, height: 1500 },
  { title: 'Travel',    key: 'love-travel.jpg',    picsumSeed: 'wanderlust', width: 1200, height: 1500 },
  { title: 'Drinks',    key: 'love-drinks.jpg',    picsumSeed: 'goldenhour', width: 1200, height: 1500 },
  { title: 'Dumpling',  key: 'love-dumpling.jpg',  picsumSeed: 'dumplinglove', width: 1200, height: 1500 },
  { title: 'Pottery',   key: 'love-pottery.jpg',   picsumSeed: 'wheelclay',  width: 1200, height: 1500 },
  { title: 'Reading',   key: 'love-reading.jpg',   picsumSeed: 'bookpages',  width: 1200, height: 1500 },
  { title: 'Squishy',   key: 'love-squishy.jpg',   picsumSeed: 'softthings', width: 1200, height: 1500 },
  { title: 'Talking',   key: 'love-talking.jpg',   picsumSeed: 'latenight',  width: 1200, height: 1500 },
  { title: 'Writing',   key: 'love-writing.jpg',   picsumSeed: 'penink',     width: 1200, height: 1500 },
  { title: 'Museum',    key: 'love-museum.jpg',    picsumSeed: 'galleryday', width: 1200, height: 1500 },
  { title: 'Reggaetón', key: 'love-reggaeton.jpg', picsumSeed: 'discodome',  width: 1200, height: 1500 },
  { title: 'Friends',   key: 'love-friends.jpg',   picsumSeed: 'roundtable', width: 1200, height: 1500 },
];

const DB_PATH = path.resolve(process.cwd(), 'payload.db');
const PUBLIC_BASE = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const s3 = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function fetchPicsum(seed: string, w: number, h: number): Promise<Buffer> {
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`picsum ${seed}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`✖ payload.db not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const insertMedia = db.prepare(`
    INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y)
    VALUES (?, ?, ?, 'image/jpeg', ?, ?, ?, 50, 50)
  `);
  const updateMedia = db.prepare(
    `UPDATE media SET alt = ?, url = ?, mime_type = 'image/jpeg', filesize = ?, width = ?, height = ? WHERE id = ?`,
  );
  const updateLove = db.prepare(`UPDATE loves SET image_id = ? WHERE title = ?`);
  const findExistingMedia = db.prepare(`SELECT id FROM media WHERE filename = ?`);
  const findLove = db.prepare(`SELECT id FROM loves WHERE title = ?`);

  console.log('==> fetching from Picsum + uploading to R2 + linking in DB\n');

  for (const item of MAPPING) {
    const buf = await fetchPicsum(item.picsumSeed, item.width, item.height);
    const meta = await sharp(buf).metadata();
    const w = meta.width ?? item.width;
    const h = meta.height ?? item.height;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: item.key,
        Body: buf,
        ContentType: 'image/jpeg',
      }),
    );

    const url = `${PUBLIC_BASE}/${encodeURIComponent(item.key)}`;
    let mediaId: number;
    const existing = findExistingMedia.get(item.key) as { id: number } | undefined;
    if (existing) {
      mediaId = existing.id;
      updateMedia.run(item.title, url, buf.length, w, h, mediaId);
    } else {
      const result = insertMedia.run(item.title, url, item.key, buf.length, w, h);
      mediaId = Number(result.lastInsertRowid);
    }

    const love = findLove.get(item.title) as { id: number } | undefined;
    if (!love) {
      console.warn(`! love titled "${item.title}" not found — skipping link`);
      continue;
    }
    updateLove.run(mediaId, item.title);

    console.log(`✓ ${item.title.padEnd(12)} → media id=${mediaId}, ${item.key} (${w}x${h}, ${(buf.length / 1024).toFixed(0)} KB)`);
  }

  db.close();
  console.log('\n==> done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
