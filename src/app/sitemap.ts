import { MetadataRoute } from 'next';
import { getAllTools } from '@/lib/tools';
import { getAllPosts, getAllCategories } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tooltive.com'; // Change to actual domain later

  const staticRoutes = [
    '',
    '/tools',
    '/blog',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const tools = getAllTools();
  const toolRoutes = tools.map((tool) => ({
    url: `${baseUrl}/${tool.category}/${tool.slug}`,
    lastModified: new Date(tool.pubDate),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const toolCategories = Array.from(new Set(tools.map(t => t.category)));
  const toolCatRoutes = toolCategories.map((cat) => ({
    url: `${baseUrl}/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const posts = await getAllPosts();
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.category}/${post.slug}`,
    lastModified: new Date(post.pubDate),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const blogCategories = await getAllCategories();
  const blogCatRoutes = blogCategories.map((cat) => ({
    url: `${baseUrl}/blog/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolCatRoutes, ...toolRoutes, ...blogCatRoutes, ...postRoutes];
}