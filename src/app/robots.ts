import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cdn-cgi/'],
    },
    sitemap: 'https://tooltive.com/sitemap.xml',
    host: 'https://tooltive.com',
  }
}