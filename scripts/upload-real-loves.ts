/**
 * Replace the Loves placeholder images with the real photos sitting in
 * `things i love/`. We re-upload to the SAME R2 keys (love-X.jpg) so the
 * URLs in the deployed payload.db stay valid — no Railway DB migration
 * needed. Content-Type is set to image/png so browsers render correctly
 * regardless of the .jpg extension in the key.
 *
 * Run with: npm run upload:real-loves
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
  file: string;
  key: string;
}

const SRC_DIR = path.resolve(process.cwd(), 'things i love');

const MAPPING: Mapping[] = [
  { title: 'Coffee',    file: 'coffee.png',    key: 'love-coffee.jpg' },
  { title: 'Travel',    file: 'travel.png',    key: 'love-travel.jpg' },
  { title: 'Drinks',    file: 'drinks.png',    key: 'love-drinks.jpg' },
  { title: 'Dumpling',  file: 'dumpling.png',  key: 'love-dumpling.jpg' },
  { title: 'Pottery',   file: 'pottery.png',   key: 'love-pottery.jpg' },
  { title: 'Reading',   file: 'reading.png',   key: 'love-reading.jpg' },
  { title: 'Squishy',   file: 'squisy.png',    key: 'love-squishy.jpg' },
  { title: 'Talking',   file: 'talking.png',   key: 'love-talking.jpg' },
  { title: 'Writing',   file: 'writing.png',   key: 'love-writing.jpg' },
  { title: 'Museum',    file: 'museum.png',    key: 'love-museum.jpg' },
  { title: 'Reggaetón', file: 'reggaeton.jpeg', key: 'love-reggaeton.jpg' },
  { title: 'Friends',   file: 'friends.png',   key: 'love-friends.jpg' },
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

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`✖ payload.db not found at ${DB_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`✖ source dir not found: ${SRC_DIR}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const updateMedia = db.prepare(
    `UPDATE media SET alt = ?, url = ?, mime_type = 'image/png', filesize = ?, width = ?, height = ? WHERE filename = ?`,
  );
  const insertMedia = db.prepare(`
    INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y)
    VALUES (?, ?, ?, 'image/png', ?, ?, ?, 50, 50)
  `);
  const findExistingMedia = db.prepare(`SELECT id FROM media WHERE filename = ?`);
  const updateLove = db.prepare(`UPDATE loves SET image_id = ? WHERE title = ?`);
  const findLove = db.prepare(`SELECT id FROM loves WHERE title = ?`);

  console.log('==> uploading real photos -> R2 + patching DB\n');

  for (const item of MAPPING) {
    const filePath = path.join(SRC_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`! missing local file: ${filePath} — skipping`);
      continue;
    }
    const buf = fs.readFileSync(filePath);
    const meta = await sharp(buf).metadata();
    const w = meta.width ?? 1200;
    const h = meta.height ?? 1500;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: item.key,
        Body: buf,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    const url = `${PUBLIC_BASE}/${encodeURIComponent(item.key)}`;
    let mediaId: number;
    const existing = findExistingMedia.get(item.key) as { id: number } | undefined;
    if (existing) {
      mediaId = existing.id;
      updateMedia.run(item.title, url, buf.length, w, h, item.key);
    } else {
      const result = insertMedia.run(item.title, url, item.key, buf.length, w, h);
      mediaId = Number(result.lastInsertRowid);
    }

    const love = findLove.get(item.title) as { id: number } | undefined;
    if (!love) {
      console.warn(`! no love titled "${item.title}" — skipping link`);
      continue;
    }
    updateLove.run(mediaId, item.title);

    console.log(`✓ ${item.title.padEnd(12)} → ${item.key} (${w}x${h}, ${(buf.length / 1024).toFixed(0)} KB)`);
  }

  db.close();
  console.log('\n==> done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
