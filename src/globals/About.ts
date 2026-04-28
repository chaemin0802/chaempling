import type { GlobalConfig } from 'payload';

export const About: GlobalConfig = {
  slug: 'about',
  access: { read: () => true },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      type: 'tabs',
      tabs: [
        { label: 'English', fields: [{ name: 'bioEn', type: 'textarea' }] },
        { label: '한국어', fields: [{ name: 'bioKr', type: 'textarea' }] },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact links',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'instagram', type: 'text' },
        { name: 'behance', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    {
      name: 'experience',
      type: 'array',
      fields: [
        { name: 'company', type: 'text' },
        { name: 'period', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'education',
      type: 'array',
      fields: [
        { name: 'school', type: 'text' },
        { name: 'degree', type: 'text' },
        { name: 'period', type: 'text' },
      ],
    },
    {
      name: 'tools',
      type: 'array',
      fields: [{ name: 'name', type: 'text' }],
    },
  ],
};
