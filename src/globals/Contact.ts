import type { GlobalConfig } from 'payload';

export const Contact: GlobalConfig = {
  slug: 'contact',
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'English',
          fields: [
            { name: 'headingEn', type: 'text' },
            { name: 'subtextEn', type: 'textarea' },
          ],
        },
        {
          label: '한국어',
          fields: [
            { name: 'headingKr', type: 'text' },
            { name: 'subtextKr', type: 'textarea' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Links',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'instagram', type: 'text' },
        { name: 'behance', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
  ],
};
