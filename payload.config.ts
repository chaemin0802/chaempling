import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import sharp from 'sharp';

import { Users } from './src/collections/Users';
import { Media } from './src/collections/Media';
import { Tools } from './src/collections/Tools';
import { Work } from './src/collections/Work';
import { Cities } from './src/collections/Cities';
import { Loves } from './src/collections/Loves';
import { About } from './src/globals/About';
import { Contact } from './src/globals/Contact';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const useR2 = !!process.env.R2_BUCKET;

// At build time on hosts like Railway the persistent volume isn't mounted yet,
// so DATABASE_URI may point to a path that doesn't exist. Fall back to the
// repo's bundled payload.db so the build can still read schema & seed data.
function resolveDatabaseUri(): string {
  const configured = process.env.DATABASE_URI || 'file:./payload.db';
  if (!configured.startsWith('file:')) return configured;
  const filePath = configured.replace(/^file:/, '');
  if (fs.existsSync(filePath)) return configured;
  const fallback = path.resolve(dirname, 'payload.db');
  if (fs.existsSync(fallback)) return `file:${fallback}`;
  return configured;
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, 'src') },
  },
  collections: [Users, Media, Tools, Work, Cities, Loves],
  globals: [About, Contact],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: { url: resolveDatabaseUri() },
    push: false,
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: useR2
    ? [
        s3Storage({
          collections: {
            media: {
              generateFileURL: ({ filename, prefix }) => {
                const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
                const key = prefix ? `${prefix}/${filename}` : filename;
                const encoded = key
                  .split('/')
                  .map((segment) => encodeURIComponent(segment))
                  .join('/');
                return `${base}/${encoded}`;
              },
            },
          },
          bucket: process.env.R2_BUCKET!,
          config: {
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            region: 'auto',
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID!,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
            requestHandler: {
              requestTimeout: 120_000,
              connectionTimeout: 30_000,
            },
          },
        }),
      ]
    : [],
});
