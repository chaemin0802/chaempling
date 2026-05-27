import projectsJson from '@/data/projects.json';
import lovesJson from '@/data/loves.json';
import citiesJson from '@/data/cities.json';
import aboutJson from '@/data/about.json';
import contactJson from '@/data/contact.json';
import type { Project, AboutData, ContactData, City, Love } from './types';

const projects = projectsJson as Project[];
const loves = lovesJson as Love[];
const cities = citiesJson as City[];
const about = aboutJson as AboutData;
const contact = contactJson as ContactData;

export async function getPublishedProjects(): Promise<Project[]> {
  return projects.filter((p) => p.published);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((p) => p.slug === slug && p.published) ?? null;
}

export async function getAboutData(): Promise<AboutData> {
  return about;
}

export async function getCities(): Promise<City[]> {
  return cities;
}

export async function getLoves(): Promise<Love[]> {
  return loves;
}

export async function getContactData(): Promise<ContactData> {
  return contact;
}
