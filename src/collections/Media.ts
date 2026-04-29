import path from 'path';
import { fileURLToPath } from 'url';
import type { CollectionConfig } from 'payload';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const mediaDir = process.env.MEDIA_DIR
  ? path.isAbsolute(process.env.MEDIA_DIR)
    ? process.env.MEDIA_DIR
    : path.resolve(process.cwd(), process.env.MEDIA_DIR)
  : path.resolve(dirname, '../../media');

function slugifyFilename(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : '';
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const stem = slug || 'file';
  return `${stem}-${Date.now().toString(36)}${ext}`;
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  admin: {
    useAsTitle: 'alt',
    hidden: true,
  },
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/*', 'video/*'],
    // Animated webp/gif with many frames easily exceed Sharp's default pixel cap.
    // Disable the cap so high-res or long animations don't 400 on upload.
    constructorOptions: { limitInputPixels: false },
  },
  hooks: {
    beforeOperation: [
      ({ req, operation }) => {
        if (operation !== 'create' && operation !== 'update') return;
        const file = (req as unknown as { file?: { name?: string } })?.file;
        if (file && typeof file.name === 'string') {
          file.name = slugifyFilename(file.name);
        }
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
};
