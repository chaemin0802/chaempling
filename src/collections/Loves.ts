import type { CollectionConfig } from 'payload';

export const Loves: CollectionConfig = {
  slug: 'loves',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tmi', 'order'],
    description: '내가 좋아하는 것들. /me 페이지 "Things I love" 갤러리에 표시됨.',
  },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'tmi',
      type: 'text',
      admin: { description: '항목 아래 작게 뜨는 한 줄.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: '낮은 숫자가 먼저 나옴.' },
    },
  ],
};
