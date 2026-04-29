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
  hooks: {
    beforeOperation: [
      ({ req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const r = req as unknown as { file?: { name?: string; size?: number; mimetype?: string } };
          if (r?.file) {
            console.log('[media:upload] incoming', {
              name: r.file.name,
              size: r.file.size,
              mimetype: r.file.mimetype,
            });
          }
        }
      },
    ],
    beforeChange: [
      ({ data, operation }) => {
        console.log('[media:beforeChange]', operation, {
          filename: (data as { filename?: string })?.filename,
          mimeType: (data as { mimeType?: string })?.mimeType,
          filesize: (data as { filesize?: number })?.filesize,
        });
        return data;
      },
    ],
    afterError: [
      async ({ error, req }) => {
        const file = (req as unknown as { file?: { name?: string; size?: number } }).file;
        console.error('[media:afterError]', {
          message: error?.message,
          stack: error?.stack,
          fileName: file?.name,
          fileSize: file?.size,
        });
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
};
