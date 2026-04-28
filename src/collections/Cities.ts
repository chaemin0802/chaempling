import type { CollectionConfig } from 'payload';

async function geocode(name: string, country: string): Promise<{ lat: number; lng: number }> {
  const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(name)}&country=${encodeURIComponent(country)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'chaempling-portfolio/1.0 (admin geocoder)' },
  });
  if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
  const json = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error(`Could not find "${name}, ${country}" — check spelling.`);
  }
  return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
}

export const Cities: CollectionConfig = {
  slug: 'cities',
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'note'],
    description: '도시 이름 + 나라만 입력하면 위치 자동으로 찾아서 별 찍음.',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        const name = data.name ?? originalDoc?.name;
        const country = data.country ?? originalDoc?.country;
        if (!name || !country) return data;

        const nameChanged = data.name && data.name !== originalDoc?.name;
        const countryChanged = data.country && data.country !== originalDoc?.country;
        const needsGeocode = operation === 'create' || nameChanged || countryChanged;

        if (!needsGeocode) return data;

        const { lat, lng } = await geocode(name, country);
        data.lat = lat;
        data.lng = lng;
        return data;
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: '도시 이름' } },
        { name: 'country', type: 'text', required: true, admin: { description: '나라 (영어)' } },
      ],
    },
    {
      name: 'note',
      type: 'text',
      admin: { description: '툴팁 추가 메모 (선택)' },
    },
    { name: 'lat', type: 'number', admin: { hidden: true } },
    { name: 'lng', type: 'number', admin: { hidden: true } },
  ],
};
