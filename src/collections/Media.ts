import path from 'path';
import { fileURLToPath } from 'url';
import type { CollectionConfig } from 'payload';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const mediaDir = process.env.MEDIA_DIR
  ? path.isAbsolute(process.env.MEDIA_DIR)
    ? process.env.MEDIA_DIR
    : path.resolve(process.cwd(), process.env.MEDIA_DIR)
  : path.resolve(dirname, '../../media');

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
  fields: [
    { name: 'alt', type: 'text' },
  ],
};
