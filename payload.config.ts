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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, 'src') },
  },
  collections: [Users, Media, Tools, Work, Cities, Loves],
  globals: [About, Contact],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./payload.db' },
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
                return `${base}/${key}`;
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
          },
        }),
      ]
    : [],
});
