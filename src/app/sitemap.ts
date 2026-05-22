import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://matgari.com';

const routes = ['', '/features', '/pricing', '/about', '/contact', '/demo', '/privacy', '/terms', '/refund'];
const locales = ['ar', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: now,
      changeFrequency: route === '' ? ('daily' as const) : ('weekly' as const),
      priority: route === '' ? 1.0 : route === '/pricing' ? 0.9 : 0.7,
      alternates: {
        languages: {
          ar: `${BASE_URL}/ar${route}`,
          en: `${BASE_URL}/en${route}`,
        },
      },
    }))
  );
}
