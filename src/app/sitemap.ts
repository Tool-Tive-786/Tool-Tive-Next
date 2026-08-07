import { MetadataRoute } from 'next';
import { getAllTools } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tooltive.com';
  
  // These dates represent the ACTUAL last meaningful content update for these pages.
  // They should NOT automatically update on every deployment.
  const STATIC_PAGES_LAST_UPDATED = new Date('2026-08-07T00:00:00.000Z');
  const LEGAL_LAST_UPDATED = new Date('2026-08-07T00:00:00.000Z');

  // --- Core Static Pages ---
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: STATIC_PAGES_LAST_UPDATED,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/all-tools`,
      lastModified: STATIC_PAGES_LAST_UPDATED, // Will update dynamically below if tools exist
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: STATIC_PAGES_LAST_UPDATED, // Will update dynamically below if posts exist
      changeFrequency: 'daily',
      priority: 0.90,
    },
  ];

  // --- Legal & Contact Pages ---
  const legalRoutes: MetadataRoute.Sitemap = [
    { url: '/contact', priority: 0.40, changeFrequency: 'monthly' as const },
    { url: '/privacy-policy', priority: 0.20, changeFrequency: 'yearly' as const },
    { url: '/terms-of-service', priority: 0.20, changeFrequency: 'yearly' as const },
    { url: '/disclaimer', priority: 0.20, changeFrequency: 'yearly' as const },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: LEGAL_LAST_UPDATED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // --- Tools & Categories ---
  const tools = getAllTools();
  
  // Update '/all-tools' lastModified based on the newest tool
  if (tools.length > 0) {
    const latestToolDate = new Date(
      tools.reduce((latest, tool) => {
        const time = new Date(tool.pubDate).getTime();
        return time > latest ? time : latest;
      }, 0)
    );
    coreRoutes[1].lastModified = latestToolDate;
  }

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/all-tools/${tool.category}/${tool.slug}`,
    lastModified: new Date(tool.pubDate),
    changeFrequency: 'monthly',
    priority: 0.90,
  }));

  // Optimize Categories: get the latest pubDate per category using reduce-like map operations
  const categoryMap = new Map<string, number>();
  tools.forEach(tool => {
    const toolTime = new Date(tool.pubDate).getTime();
    const currentMax = categoryMap.get(tool.category) || 0;
    if (toolTime > currentMax) {
      categoryMap.set(tool.category, toolTime);
    }
  });

  const toolCatRoutes: MetadataRoute.Sitemap = Array.from(categoryMap.entries()).map(([cat, time]) => ({
    url: `${baseUrl}/all-tools/${cat}`,
    lastModified: new Date(time),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // --- Blog Posts ---
  const posts = await getAllPosts();
  
  // Update '/blog' lastModified based on the newest post
  if (posts.length > 0) {
    const latestPostDate = new Date(
      posts.reduce((latest, post) => {
        const time = new Date(post.pubDate).getTime();
        return time > latest ? time : latest;
      }, 0)
    );
    coreRoutes[2].lastModified = latestPostDate;
  }

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.category}/${post.slug}`,
    lastModified: new Date(post.pubDate),
    changeFrequency: 'monthly', 
    priority: 0.80,
  }));

  return [...coreRoutes, ...legalRoutes, ...toolCatRoutes, ...toolRoutes, ...postRoutes];
}