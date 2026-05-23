import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${siteUrl}/registro`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${siteUrl}/noticias`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${siteUrl}/eventos`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${siteUrl}/piezas-robadas`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${siteUrl}/foro`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${siteUrl}/comunidad`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${siteUrl}/contacto`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${siteUrl}/privacidad`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${siteUrl}/terminos`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${siteUrl}/aviso-legal`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ];
}
