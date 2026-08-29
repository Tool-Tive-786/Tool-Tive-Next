import type { DiscoveredUrl } from "./types";

export const MAX_SITEMAP_URLS = 50000;
export const MAX_SITEMAP_MB = 50;
export const MAX_SITEMAP_BYTES = MAX_SITEMAP_MB * 1024 * 1024;

export const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";

/**
 * Escapes special XML characters securely.
 */
export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

/**
 * Generates a single `<urlset>` XML string.
 */
export function generateUrlset(urls: DiscoveredUrl[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="${SITEMAP_NAMESPACE}">\n`;

  for (const item of urls) {
    if (item.decision !== "included") continue;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.normalizedUrl)}</loc>\n`;
    
    if (item.lastModified) {
      xml += `    <lastmod>${escapeXml(item.lastModified)}</lastmod>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Generates a `<sitemapindex>` XML string.
 */
export function generateSitemapIndex(sitemapUrls: string[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="${SITEMAP_NAMESPACE}">\n`;

  for (const loc of sitemapUrls) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>`;
  return xml;
}

/**
 * Result of generating sitemaps. Handles splitting automatically.
 */
export interface SitemapGenerationResult {
  files: { filename: string; content: string }[];
  isSplit: boolean;
}

/**
 * Generates the sitemaps. Splits into multiple files and creates an index if limits are exceeded.
 */
export function buildSitemaps(urls: DiscoveredUrl[], baseUrl: string): SitemapGenerationResult {
  const includedUrls = urls.filter(u => u.decision === "included");

  if (includedUrls.length <= MAX_SITEMAP_URLS) {
    // Attempt single file first
    const singleXml = generateUrlset(includedUrls);
    // Rough byte size check (UTF-8)
    const byteSize = new Blob([singleXml]).size; 
    
    if (byteSize <= MAX_SITEMAP_BYTES) {
      return {
        files: [{ filename: "sitemap.xml", content: singleXml }],
        isSplit: false
      };
    }
  }

  // Need splitting
  const files: { filename: string; content: string }[] = [];
  const sitemapUrls: string[] = [];
  
  let currentUrls: DiscoveredUrl[] = [];
  let fileIndex = 1;

  for (const url of includedUrls) {
    currentUrls.push(url);
    if (currentUrls.length === MAX_SITEMAP_URLS) {
      const xml = generateUrlset(currentUrls);
      const filename = `sitemap-${fileIndex}.xml`;
      files.push({ filename, content: xml });
      
      const absoluteUrl = new URL(filename, baseUrl).toString();
      sitemapUrls.push(absoluteUrl);
      
      currentUrls = [];
      fileIndex++;
    }
  }

  if (currentUrls.length > 0) {
    const xml = generateUrlset(currentUrls);
    const filename = `sitemap-${fileIndex}.xml`;
    files.push({ filename, content: xml });
    
    const absoluteUrl = new URL(filename, baseUrl).toString();
    sitemapUrls.push(absoluteUrl);
  }

  // Create sitemap index
  const indexXml = generateSitemapIndex(sitemapUrls);
  files.push({ filename: "sitemap-index.xml", content: indexXml });

  return {
    files,
    isSplit: true
  };
}
