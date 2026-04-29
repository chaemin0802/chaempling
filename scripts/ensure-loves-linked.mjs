// On every boot: make sure every Loves row has an image_id pointing to a
// real media row. If a love already has an image (e.g. user uploaded one
// via /admin), leave it alone. Otherwise link it to the placeholder we
// pre-uploaded to R2.
//
// Idempotent. Safe to run on every container start.
import { createClient } from '@libsql/client';

const PUBLIC_BASE = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
const uri = process.env.DATABASE_URI || 'file:./payload.db';

if (!PUBLIC_BASE) {
  console.log('[ensure-loves] R2_PUBLIC_URL not set, skipping');
  process.exit(0);
}

const MAPPING = [
  { title: 'Coffee',    key: 'love-coffee.jpg' },
  { title: 'Travel',    key: 'love-travel.jpg' },
  { title: 'Drinks',    key: 'love-drinks.jpg' },
  { title: 'Dumpling',  key: 'love-dumpling.jpg' },
  { title: 'Pottery',   key: 'love-pottery.jpg' },
  { title: 'Reading',   key: 'love-reading.jpg' },
  { title: 'Squishy',   key: 'love-squishy.jpg' },
  { title: 'Talking',   key: 'love-talking.jpg' },
  { title: 'Writing',   key: 'love-writing.jpg' },
  { title: 'Museum',    key: 'love-museum.jpg' },
  { title: 'Reggaetón', key: 'love-reggaeton.jpg' },
  { title: 'Friends',   key: 'love-friends.jpg' },
];

const db = createClient({ url: uri });

async function main() {
  let linked = 0;
  let skipped = 0;

  for (const item of MAPPING) {
    const love = await db.execute({
      sql: 'SELECT id, image_id FROM loves WHERE title = ?',
      args: [item.title],
    });
    if (love.rows.length === 0) {
      console.log(`[ensure-loves] no row for "${item.title}", skipping`);
      continue;
    }

    const loveRow = love.rows[0];
    if (loveRow.image_id != null) {
      const m = await db.execute({
        sql: 'SELECT id FROM media WHERE id = ?',
        args: [loveRow.image_id],
      });
      if (m.rows.length > 0) {
        skipped++;
        continue;
      }
    }

    const url = `${PUBLIC_BASE}/${encodeURIComponent(item.key)}`;
    let mediaId;
    const existing = await db.execute({
      sql: 'SELECT id FROM media WHERE filename = ?',
      args: [item.key],
    });
    if (existing.rows.length > 0) {
      mediaId = existing.rows[0].id;
    } else {
      const result = await db.execute({
        sql: `INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y)
              VALUES (?, ?, ?, 'image/jpeg', 0, 1200, 1500, 50, 50)`,
        args: [item.title, url, item.key],
      });
      mediaId = Number(result.lastInsertRowid);
    }

    await db.execute({
      sql: 'UPDATE loves SET image_id = ? WHERE id = ?',
      args: [mediaId, loveRow.id],
    });
    linked++;
    console.log(`[ensure-loves] linked "${item.title}" -> media ${mediaId}`);
  }

  console.log(`[ensure-loves] done. linked=${linked} skipped=${skipped}`);
}

main().catch((e) => {
  console.error('[ensure-loves] error:', e);
  process.exit(0);
});
