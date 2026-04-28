export interface NotionBlock {
  id: string;
  type: string;
  text?: string;
  url?: string;
  caption?: string;
  language?: string;
  children?: NotionBlock[];
}

export interface GalleryImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  mimeType: string;
}

export interface Project {
  id: string;
  title: string;
  titleKr: string;
  slug: string;
  category: string;
  year: number;
  tools: string[];
  coverUrl: string;
  coverMimeType: string;
  coverWidth: number;
  coverHeight: number;
  homeCoverUrl: string;
  homeCoverMimeType: string;
  homeCoverWidth: number;
  homeCoverHeight: number;
  descriptionEn: string;
  descriptionKr: string;
  published: boolean;
  images: string[];
  gallery: GalleryImage[];
  blocks: NotionBlock[];
}

export interface Experience {
  company: string;
  period: string;
  role: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  period: string;
}

export interface AboutData {
  name: string;
  role: string;
  bioEn: string;
  bioKr: string;
  photoUrl: string;
  email: string;
  instagram: string;
  behance: string;
  linkedin: string;
  experience: Experience[];
  education: Education[];
  tools: string[];
}

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  note?: string;
}

export interface Love {
  id: string;
  title: string;
  tmi: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  alt: string;
}

export interface ContactData {
  email: string;
  instagram: string;
  behance: string;
  linkedin: string;
  headingEn: string;
  headingKr: string;
  subtextEn: string;
  subtextKr: string;
}
