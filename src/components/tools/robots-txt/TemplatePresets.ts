/**
 * Pre-configured robots.txt templates for common SEO and architecture scenarios.
 */

export interface RobotsTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  content: string;
}

export const ROBOTS_TEMPLATES: RobotsTemplate[] = [
  {
    id: "recommended-seo",
    title: "Standard SEO (Recommended)",
    badge: "Most Popular",
    description: "Allows full crawl access while protecting common admin and sensitive directories.",
    content: `# Standard robots.txt for production sites
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
`
  },
  {
    id: "block-ai-bots",
    title: "Block AI Scrapers & LLMs",
    badge: "Privacy Focused",
    description: "Permits general search engines (Google, Bing) while explicitly disallowing AI training crawlers.",
    content: `# Block AI & LLM training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
`
  },
  {
    id: "wordpress",
    title: "WordPress Standard",
    badge: "CMS Preset",
    description: "Standard configuration for WordPress installations, allowing admin-ajax for interactive elements.",
    content: `# WordPress standard robots.txt
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /wp-includes/
Allow: /wp-includes/js/
Allow: /wp-includes/css/

Sitemap: https://example.com/sitemap_index.xml
`
  },
  {
    id: "ecommerce",
    title: "E-Commerce / Shopify",
    badge: "Online Store",
    description: "Protects user carts, checkout, customer accounts, and internal search result pages.",
    content: `# E-commerce robots.txt
User-agent: *
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /account
Disallow: /search?*
Allow: /

Sitemap: https://example.com/sitemap.xml
`
  },
  {
    id: "block-all",
    title: "Block Everything (Staging / Development)",
    badge: "Caution",
    description: "Instructs all crawlers not to crawl any pages. Perfect for staging environments.",
    content: `# Block all web crawlers from entire site
User-agent: *
Disallow: /
`
  },
  {
    id: "allow-all",
    title: "Unrestricted Allow All",
    badge: "Open Access",
    description: "Completely open robots.txt permitting all crawlers unrestricted access to everything.",
    content: `# Allow all web crawlers
User-agent: *
Allow: /
Disallow:
`
  }
];
