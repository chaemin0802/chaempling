import type { CollectionConfig, FieldHook } from 'payload';

function slugify(s: string): string {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const deriveSlug: FieldHook = ({ data, originalDoc, value }) => {
  const title = data?.title ?? originalDoc?.title ?? '';
  const titleKr = data?.titleKr ?? originalDoc?.titleKr ?? '';
  const source = title || titleKr;
  const derived = slugify(source);
  return derived || value || originalDoc?.slug || `post-${Date.now()}`;
};

export const Work: CollectionConfig = {
  slug: 'work',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'category', 'year', 'published'],
    listSearchableFields: ['title', 'titleKr', 'category'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'order',
      type: 'number',
      label: '순서',
      defaultValue: 100,
      admin: {
        description: '낮은 숫자가 앞으로. 같으면 연도 최신순. 10·20·30처럼 띄워 두면 사이에 끼워 넣기 편해요.',
        position: 'sidebar',
        step: 1,
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'titleKr', type: 'text', label: 'Title (KR)' },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { hidden: true },
      hooks: { beforeValidate: [deriveSlug] },
    },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'text' },
        { name: 'year', type: 'number', defaultValue: new Date().getFullYear() },
      ],
    },
    {
      name: 'tools',
      type: 'relationship',
      relationTo: 'tools',
      hasMany: true,
      label: '도구',
      admin: {
        description: '미리 추가한 도구 중 선택. 여기서도 바로 추가 가능.',
        allowCreate: true,
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: '커버 (선택)',
      admin: {
        description: 'Work 목록·상세 상단 배너용. 비우면 갤러리 첫 번째 파일이 대신 쓰임.',
        components: {
          Field: '/components/admin/UploadDropzone#default',
        },
      },
    },
    {
      name: 'homeCover',
      type: 'upload',
      relationTo: 'media',
      label: '홈(만두) 커버 (선택)',
      admin: {
        description: '메인 홈의 떠다니는 카드 전용. 비우면 일반 커버가 대신 쓰임.',
        components: {
          Field: '/components/admin/UploadDropzone#default',
        },
      },
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: '사진',
      admin: {
        description: '여러 장 드래그해서 놓기. 썸네일 드래그로 순서 변경. 상세 페이지에서 여백 없이 위→아래로 쌓임.',
        components: {
          Field: '/components/admin/UploadDropzone#default',
        },
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'descriptionEn', type: 'textarea', label: 'Short description (EN)' },
        { name: 'descriptionKr', type: 'textarea', label: '짧은 설명 (KR)' },
      ],
    },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
};
