import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // Sabhi standard search engines (Google, Bing, Yahoo) aur AI/LLM bots (GPTBot, Claude, etc.) ko sab kuch crawl karne ki ijazat
                userAgent: '*',
                allow: '/',
            },
            {
                // Google AdSense crawler ko explicitly allow kiya gaya hai taake ads perfectly serve hon
                userAgent: 'Mediapartners-Google',
                allow: '/',
            }
        ],
        sitemap: 'https://tooltive.com/sitemap.xml',
    };
}