import type { CollectionConfig } from 'payload';

export const Tools: CollectionConfig = {
  slug: 'tools',
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
    description: '작업 도구 목록 (Figma, Photoshop 등). Work에서 이 중 선택해서 씀.',
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
  ],
};
