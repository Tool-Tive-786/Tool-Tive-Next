import { parseRobotsTxt } from "../robots-txt/parser";
import { ParsedRobotsTxt, SitemapDirective } from "../robots-txt/types";
import { fetchRobotsTxtRaw } from "../sitemap/robots";
import { validateAndNormalizeTargetUrl, isSameOrigin } from "./url-validation";
import { BASIC_MAX_RESPONSE_BYTES } from "./constants";
import { XMLParser } from "fast-xml-parser";

export interface DiscoveryResult {
  robotsTxt: string | null;
  robotsParsed: ParsedRobotsTxt | null;
  sitemapUrls: string[];
  discoveredUrls: string[]; // URLs found in sitemaps
  llmsTxtFound?: boolean;
}

export async function discoverSite(rootUrl: string): Promise<DiscoveryResult> {
  const result: DiscoveryResult = {
    robotsTxt: null,
    robotsParsed: null,
    sitemapUrls: [],
    discoveredUrls: [],
    llmsTxtFound: false,
  };

  const validation = validateAndNormalizeTargetUrl(rootUrl);
  if (!validation.safe || !validation.host || !validation.normalizedUrl) {
    return result;
  }

  const origin = `${new URL(validation.normalizedUrl).protocol}//${validation.host}`;

  // 1. Fetch robots.txt
  try {
    const rawRobots = await fetchRobotsTxtRaw(origin);
    if (rawRobots) {
      result.robotsTxt = rawRobots;
      result.robotsParsed = parseRobotsTxt(rawRobots);
      // Extract sitemaps (filter for SSRF safety and same origin)
      result.robotsParsed.sitemaps.forEach((sm: SitemapDirective) => {
        if (sm.url) {
          const val = validateAndNormalizeTargetUrl(sm.url);
          if (val.safe && val.normalizedUrl && isSameOrigin(val.normalizedUrl, origin)) {
            result.sitemapUrls.push(val.normalizedUrl);
          }
        }
      });
    }
  } catch {
    // Robots unreachable, continue
  }

  // 2. Fallback Sitemap if not found
  if (result.sitemapUrls.length === 0) {
    result.sitemapUrls.push(`${origin}/sitemap.xml`);
  }

  // 3. Optional ecosystem signal: detect llms.txt passively
  try {
    const llmsUrl = `${origin}/llms.txt`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const llmsRes = await fetch(llmsUrl, {
      headers: { "User-Agent": "ToolTiveCrawler/1.0 (+https://tooltive.com)" },
      signal: controller.signal,
      redirect: "manual",
    });
    clearTimeout(timeoutId);
    if (llmsRes.status === 200) {
      const contentType = llmsRes.headers.get("content-type") || "";
      if (contentType.includes("text/plain") || contentType.includes("markdown") || contentType.includes("text/")) {
        result.llmsTxtFound = true;
      }
    }
  } catch {
    // llms.txt not present or unreachable
  }

  // 4. Fetch sitemaps (bounded budget: max 3 sitemaps, max 100 discovered URLs)
  const MAX_SITEMAP_FETCHES = 3;
  const MAX_URLS_TO_DISCOVER = 100;
  
  const sitemapsToFetch = [...result.sitemapUrls].slice(0, MAX_SITEMAP_FETCHES);
  let fetchedCount = 0;
  const parser = new XMLParser({ ignoreAttributes: false });

  while (sitemapsToFetch.length > 0 && fetchedCount < MAX_SITEMAP_FETCHES && result.discoveredUrls.length < MAX_URLS_TO_DISCOVER) {
    const smUrl = sitemapsToFetch.shift()!;
    fetchedCount++;
    
    // SSRF & same-origin verification before fetch
    const smVal = validateAndNormalizeTargetUrl(smUrl);
    if (!smVal.safe || !smVal.normalizedUrl || !isSameOrigin(smVal.normalizedUrl, origin)) {
      continue; // Block external or private sitemap destinations
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(smVal.normalizedUrl, { 
        headers: { 
          "User-Agent": "ToolTiveCrawler/1.0 (+https://tooltive.com)",
          "Accept": "application/xml,text/xml,*/*;q=0.8"
        },
        signal: controller.signal,
        redirect: "manual"
      });
      clearTimeout(timeoutId);
      
      const contentType = res.headers.get("content-type") || "";
      if (res.status === 200 && (contentType.includes("xml") || contentType.includes("text/plain"))) {
        const text = await res.text();
        // Budget safety: enforce 1 MiB limit
        if (text.length > BASIC_MAX_RESPONSE_BYTES) continue;
        
        const parsed = parser.parse(text);
        
        if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
          const sitemaps = Array.isArray(parsed.sitemapindex.sitemap) ? parsed.sitemapindex.sitemap : [parsed.sitemapindex.sitemap];
          for (const sm of sitemaps) {
            if (sm.loc && typeof sm.loc === "string") {
              const locVal = validateAndNormalizeTargetUrl(sm.loc);
              if (locVal.safe && locVal.normalizedUrl && isSameOrigin(locVal.normalizedUrl, origin)) {
                sitemapsToFetch.push(locVal.normalizedUrl);
              }
            }
          }
        } else if (parsed.urlset && parsed.urlset.url) {
          const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
          for (const u of urls) {
            if (u.loc && typeof u.loc === "string" && result.discoveredUrls.length < MAX_URLS_TO_DISCOVER) {
              const norm = validateAndNormalizeTargetUrl(u.loc);
              if (norm.safe && norm.normalizedUrl && isSameOrigin(norm.normalizedUrl, origin)) {
                result.discoveredUrls.push(norm.normalizedUrl);
              }
            }
          }
        }
      }
    } catch {
      // ignore individual failures gracefully
    }
  }

  // Deduplicate
  result.discoveredUrls = Array.from(new Set(result.discoveredUrls));

  return result;
}
