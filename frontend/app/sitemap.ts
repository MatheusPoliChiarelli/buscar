import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscar-omega.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/revendas`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/termos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const [vehiclesRes, dealershipsRes] = await Promise.all([
      fetch(`${API_URL}/vehicles`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/dealerships`, { next: { revalidate: 3600 } }),
    ]);

    const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : [];
    const dealerships = dealershipsRes.ok ? await dealershipsRes.json() : [];

    const vehiclePages: MetadataRoute.Sitemap = vehicles.map((v: { id: number; created_at: string }) => ({
      url: `${SITE_URL}/veiculo/${v.id}`,
      lastModified: new Date(v.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    const dealershipPages: MetadataRoute.Sitemap = dealerships.map((d: { id: number }) => ({
      url: `${SITE_URL}/revendas/${d.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...vehiclePages, ...dealershipPages];
  } catch {
    return staticPages;
  }
}