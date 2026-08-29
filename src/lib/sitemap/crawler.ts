import * as cheerio from "cheerio";
import { normalizeUrl, isValidUrl } from "./url";
import { isSafeOrigin } from "./robots";

export interface CrawlResult {
  url: string;
  normalizedUrl: string;
  status: number;
  contentType: string;
  finalUrl?: string; // If redirect
  canonicalUrl?: string;
  canonicalStatus: "match" | "mismatch" | "missing";
  noindex: boolean;
  internalLinks: string[];
  lastModified?: string;
}

/**
 * Safely fetches a single URL, checks status, canonical, noindex, and extracts internal links.
 * Uses manual redirect handling to track redirect chains.
 */
export async function crawlSingleUrl(targetUrl: string, originHost: string, userAgent = "ToolTiveCrawler/1.0 (https://tooltive.com)"): Promise<CrawlResult | null> {
  if (!isSafeOrigin(targetUrl)) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(targetUrl, { 
      headers: { "User-Agent": userAgent },
      signal: controller.signal,
      redirect: "manual"
    });
    
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const normalizedTarget = normalizeUrl(targetUrl) || targetUrl;

    const result: CrawlResult = {
      url: targetUrl,
      normalizedUrl: normalizedTarget,
      status: res.status,
      contentType,
      canonicalStatus: "missing",
      noindex: false,
      internalLinks: []
    };

    // Handle Redirects
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        try {
          const absoluteLocation = new URL(location, targetUrl).toString();
          if (isSafeOrigin(absoluteLocation)) {
             result.finalUrl = normalizeUrl(absoluteLocation) || absoluteLocation;
          }
        } catch {}
      }
      return result; // Don't parse HTML for redirects
    }

    // Process HTML for 2xx
    if (contentType.includes("text/html") && res.status >= 200 && res.status < 300) {
      const html = await res.text();
      const $ = cheerio.load(html);

      // 1. Canonical Detection (Check HTTP header first, then HTML)
      let canonicalTag = "";
      const linkHeader = res.headers.get("link");
      if (linkHeader) {
         const match = linkHeader.match(/<([^>]+)>;\s*rel="canonical"/i);
         if (match) canonicalTag = match[1];
      }
      
      if (!canonicalTag) {
         canonicalTag = $("link[rel='canonical']").attr("href") || "";
      }

      if (canonicalTag) {
        try {
          const canonicalAbsolute = new URL(canonicalTag, targetUrl).toString();
          const normCanonical = normalizeUrl(canonicalAbsolute);
          if (normCanonical) {
            result.canonicalUrl = normCanonical;
            result.canonicalStatus = (normCanonical === normalizedTarget) ? "match" : "mismatch";
          }
        } catch {}
      }

      // 2. Noindex Detection
      $("meta[name='robots'], meta[name='googlebot']").each((_, el) => {
        const content = $(el).attr("content")?.toLowerCase() || "";
        if (content.includes("noindex")) {
          result.noindex = true;
        }
      });
      const xRobots = res.headers.get("X-Robots-Tag")?.toLowerCase() || "";
      if (xRobots.includes("noindex")) {
        result.noindex = true;
      }

      // 3. Lastmod Detection
      const articleMod = $("meta[property='article:modified_time']").attr("content");
      if (articleMod && !isNaN(Date.parse(articleMod))) {
        result.lastModified = new Date(articleMod).toISOString();
      }

      // 4. Extract Internal Links
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        
        try {
          const absoluteUrl = new URL(href, targetUrl);
          if (absoluteUrl.hostname === originHost && 
              (absoluteUrl.protocol === "http:" || absoluteUrl.protocol === "https:")) {
             const norm = normalizeUrl(absoluteUrl.toString());
             if (norm) result.internalLinks.push(norm);
          }
        } catch {}
      });
      
      result.internalLinks = Array.from(new Set(result.internalLinks));
    }

    return result;
  } catch (err) {
    return null;
  }
}
