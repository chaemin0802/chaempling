/**
 * One-time migration: upload everything in ./media to Cloudflare R2.
 *
 * Run:  npm run migrate:media
 *
 * Reads R2_* env vars from .env.local. Skips files that already exist in the
 * bucket (resumable). Logs progress to stdout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

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

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.heic': 'image/heic',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
};

function mimeFor(filename: string): string {
  return MIME[path.extname(filename).toLowerCase()] || 'application/octet-stream';
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const client = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;
const SRC = path.resolve(process.cwd(), 'media');

if (!fs.existsSync(SRC)) {
  console.error(`✖ media directory not found: ${SRC}`);
  process.exit(1);
}

async function exists(key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function upload(file: string) {
  const filepath = path.join(SRC, file);
  const stat = fs.statSync(filepath);
  if (!stat.isFile()) return { skipped: true as const, reason: 'not-a-file' };
  if (await exists(file)) return { skipped: true as const, reason: 'already-uploaded' };

  const body = fs.readFileSync(filepath);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: file,
      Body: body,
      ContentType: mimeFor(file),
    }),
  );
  return { skipped: false as const, size: stat.size };
}

async function main() {
  const all = fs.readdirSync(SRC);
  console.log(`found ${all.length} entries in ${SRC}`);
  console.log(`uploading to bucket: ${BUCKET}\n`);

  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;
  let i = 0;

  for (const file of all) {
    i++;
    const tag = `[${i}/${all.length}]`;
    try {
      const result = await upload(file);
      if (result.skipped) {
        skipped++;
        console.log(`${tag} skip   ${file}  (${result.reason})`);
      } else {
        uploaded++;
        bytes += result.size;
        console.log(`${tag} ok     ${file}  ${fmtBytes(result.size)}`);
      }
    } catch (err) {
      console.error(`${tag} ERROR  ${file}`, err);
    }
  }

  console.log(`\nuploaded: ${uploaded}  skipped: ${skipped}  total bytes: ${fmtBytes(bytes)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
