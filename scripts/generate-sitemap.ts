import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahal.app';
const locales = ['en', 'ar'];

const staticRoutes = [
  '',
  '/hotels',
  '/destinations',
  '/about',
  '/planner',
  '/chat',
  '/trips',
  '/account',
  '/booking',
  '/bookings',
  '/pricing',
  '/privacy',
  '/terms',
  '/favorites',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

async function fetchDynamicRoutes(): Promise<{ path: string; lastmod: string }[]> {
  const dynamicRoutes: { path: string; lastmod: string }[] = [];
  
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const hotelsResponse = await fetch(`${apiBase}/hotels?limit=1000`, { 
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' }
    });
    if (hotelsResponse.ok) {
      const hotelsData = await hotelsResponse.json();
      const hotels = hotelsData.data?.data || hotelsData.data || hotelsData;
      for (const hotel of hotels) {
        if (hotel.slug) {
          dynamicRoutes.push({
            path: `/hotels/${hotel.slug}`,
            lastmod: hotel.updatedAt || new Date().toISOString(),
          });
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch hotels for sitemap:', e);
  }
  
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const destinationsResponse = await fetch(`${apiBase}/destinations?limit=100`, { 
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' }
    });
    if (destinationsResponse.ok) {
      const destData = await destinationsResponse.json();
      const destinations = destData.data?.data || destData.data || destData;
      for (const dest of destinations) {
        if (dest.slug) {
          dynamicRoutes.push({
            path: `/destinations/${dest.slug}`,
            lastmod: dest.updatedAt || new Date().toISOString(),
          });
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch destinations for sitemap:', e);
  }
  
  return dynamicRoutes;
}

function generateUrlEntry(url: string, lastmod?: string, changefreq?: string, priority?: number): string {
  let entry = `  <url>\n    <loc>${url}</loc>\n`;
  if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) entry += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) entry += `    <priority>${priority}</priority>\n`;
  
  // Add hreflang alternates
  for (const locale of locales) {
    const altUrl = url.replace(`/${locales[0]}/`, `/${locale}/`).replace(`/${locales[1]}/`, `/${locale}/`);
    if (url.includes(`/${locale}/`)) {
      entry += `    <xhtml:link rel="alternate" hreflang="${locale}" href="${altUrl}" />\n`;
    }
  }
  entry += `  </url>\n`;
  return entry;
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  const dynamicRoutes = await fetchDynamicRoutes();
  console.log(`Found ${dynamicRoutes.length} dynamic routes`);
  
  const allRoutes = [
    ...staticRoutes.map(path => ({ path, lastmod: new Date().toISOString() })),
    ...dynamicRoutes,
  ];
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  for (const route of allRoutes) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${route.path}`;
      const priority = route.path === '' ? 1.0 : route.path.split('/').length > 2 ? 0.7 : 0.8;
      const changefreq = route.path === '' ? 'daily' : 'weekly';
      
      sitemap += generateUrlEntry(url, route.lastmod, changefreq, priority);
    }
  }
  
  sitemap += '</urlset>\n';
  
  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  
  writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated at public/sitemap.xml');
  
  // Also generate sitemap index if we have many URLs
  if (allRoutes.length * locales.length > 50000) {
    console.warn('Sitemap exceeds 50,000 URLs, consider splitting into multiple sitemaps');
  }
}

generateSitemap().catch(console.error);