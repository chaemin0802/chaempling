/**
 * One-shot: assign a chosen image to each Loves item, upload to R2, and patch
 * the local payload.db so the relationship sticks. After this, push the DB
 * to GitHub and re-seed the Railway volume so the production site picks up
 * the same linkages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
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

// title (matching DB) → source image path → desired R2 filename
const MAPPING: Array<{ title: string; src: string; key: string }> = [
  {
    title: 'Coffee',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.11.52 AM.png',
    key: 'love-coffee.png',
  },
  {
    title: 'Travel',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.30.55 AM.png',
    key: 'love-travel.png',
  },
  {
    title: 'Drinks',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.30.43 AM.png',
    key: 'love-drinks.png',
  },
  {
    title: 'Dumpling',
    src: '/Users/user/Downloads/Screenshot 2026-04-29 at 2.49.07 AM.png',
    key: 'love-dumpling.png',
  },
  {
    title: 'Pottery',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.28.49 AM.png',
    key: 'love-pottery.png',
  },
  {
    title: 'Reading',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.30.27 AM.png',
    key: 'love-reading.png',
  },
  {
    title: 'Squishy',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.30.15 AM.png',
    key: 'love-squishy.png',
  },
  {
    title: 'Talking',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.30.04 AM.png',
    key: 'love-talking.png',
  },
  {
    title: 'Writing',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.29.49 AM.png',
    key: 'love-writing.png',
  },
  {
    title: 'Museum',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.29.37 AM.png',
    key: 'love-museum.png',
  },
  {
    title: 'Reggaetón',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.29.26 AM.png',
    key: 'love-reggaeton.png',
  },
  {
    title: 'Friends',
    src: '/Users/user/Desktop/Screenshot 2026-04-29 at 4.29.14 AM.png',
    key: 'love-friends.png',
  },
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

async function uploadOne(srcPath: string, key: string) {
  const body = fs.readFileSync(srcPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: 'image/png',
    }),
  );
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`✖ payload.db not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  console.log('==> uploading images to R2 + inserting media rows + linking to loves\n');

  const insertMedia = db.prepare(`
    INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y)
    VALUES (?, ?, ?, 'image/png', ?, ?, ?, 50, 50)
  `);
  const updateLove = db.prepare(`UPDATE loves SET image_id = ? WHERE title = ?`);
  const findExistingMedia = db.prepare(`SELECT id FROM media WHERE filename = ?`);
  const findLove = db.prepare(`SELECT id FROM loves WHERE title = ?`);

  for (const item of MAPPING) {
    if (!fs.existsSync(item.src)) {
      console.warn(`! skip ${item.title}: source missing — ${item.src}`);
      continue;
    }
    const stat = fs.statSync(item.src);
    const meta = await sharp(item.src).metadata();
    const width = meta.width ?? 1600;
    const height = meta.height ?? 1200;

    // upload to R2
    await uploadOne(item.src, item.key);

    const url = `${PUBLIC_BASE}/${encodeURIComponent(item.key)}`;

    // insert media row (or reuse if exists)
    let mediaId: number;
    const existing = findExistingMedia.get(item.key) as { id: number } | undefined;
    if (existing) {
      mediaId = existing.id;
      db.prepare(
        `UPDATE media SET url = ?, mime_type = 'image/png', filesize = ?, width = ?, height = ? WHERE id = ?`,
      ).run(url, stat.size, width, height, mediaId);
    } else {
      const result = insertMedia.run(item.title, url, item.key, stat.size, width, height);
      mediaId = Number(result.lastInsertRowid);
    }

    const love = findLove.get(item.title) as { id: number } | undefined;
    if (!love) {
      console.warn(`! love titled "${item.title}" not found in DB — skipping link`);
      continue;
    }
    updateLove.run(mediaId, item.title);

    console.log(`✓ ${item.title.padEnd(12)} → media id=${mediaId}, ${item.key} (${width}x${height})`);
  }

  db.close();
  console.log('\n==> done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
