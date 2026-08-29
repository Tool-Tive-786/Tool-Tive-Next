import { XMLParser, XMLValidator } from "fast-xml-parser";
import { isValidUrl, normalizeUrl } from "./url";
import { MAX_SITEMAP_URLS, MAX_SITEMAP_BYTES } from "./xml-serializer";
import type { SitemapHealthResult, SitemapIssue, SitemapDocument, DiscoveredUrl } from "./types";

/**
 * Validates and parses an XML sitemap safely.
 */
export function validateAndParseSitemap(xmlString: string, origin?: string): {
  health: SitemapHealthResult;
  document: SitemapDocument | null;
} {
  const issues: SitemapIssue[] = [];
  
  // 1. Basic Length / Size Checks
  const byteSize = new Blob([xmlString]).size;
  if (byteSize > MAX_SITEMAP_BYTES) {
    issues.push({
      severity: "Error",
      message: `Sitemap exceeds 50MB uncompressed limit (${(byteSize / 1024 / 1024).toFixed(2)} MB).`,
      suggestion: "Split this sitemap into multiple smaller files and use a sitemap index."
    });
  }

  // 2. Syntax Validation
  const validationResult = XMLValidator.validate(xmlString);
  if (validationResult !== true) {
    issues.push({
      severity: "Critical",
      message: `Invalid XML syntax: ${validationResult.err.msg} at line ${validationResult.err.line}`,
      suggestion: "Ensure the XML is well-formed."
    });
    return { health: calculateHealth(issues), document: null };
  }

  // 3. Safe Parsing (ignore attributes, avoid executing malicious entities)
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    trimValues: true,
    // Prevents prototype pollution
    updateTag: (tagName) => tagName === "__proto__" ? false : tagName, 
  });

  let parsed: any;
  try {
    parsed = parser.parse(xmlString);
  } catch (err) {
    issues.push({
      severity: "Critical",
      message: "Failed to parse XML document.",
    });
    return { health: calculateHealth(issues), document: null };
  }

  // 4. Structure Validation
  let document: SitemapDocument | null = null;
  
  if (parsed.urlset) {
    // Standard Sitemap
    let urls = parsed.urlset.url;
    if (!urls) urls = [];
    if (!Array.isArray(urls)) urls = [urls]; // Handle single URL case

    if (urls.length > MAX_SITEMAP_URLS) {
      issues.push({
        severity: "Error",
        message: `Sitemap contains ${urls.length} URLs, exceeding the 50,000 limit.`,
        suggestion: "Split this sitemap."
      });
    }

    const discoveredUrls: DiscoveredUrl[] = [];
    const seen = new Set<string>();
    let invalidCount = 0;
    let dupCount = 0;
    let nonOriginCount = 0;

    for (const item of urls) {
      if (!item.loc) continue;
      const rawLoc = item.loc;
      
      if (!isValidUrl(rawLoc)) {
        invalidCount++;
        continue;
      }

      const normalized = normalizeUrl(rawLoc);
      if (!normalized) continue;

      if (seen.has(normalized)) {
        dupCount++;
      } else {
        seen.add(normalized);
      }

      if (origin && !normalized.startsWith(origin)) {
         nonOriginCount++;
      }

      discoveredUrls.push({
        url: rawLoc,
        normalizedUrl: normalized,
        lastModified: item.lastmod,
        decision: "included",
        source: "user-input"
      });
    }

    if (invalidCount > 0) issues.push({ severity: "Error", message: `${invalidCount} invalid or relative URLs found.`, count: invalidCount });
    if (dupCount > 0) issues.push({ severity: "Warning", message: `${dupCount} duplicate URLs found after normalization.`, count: dupCount });
    if (nonOriginCount > 0) issues.push({ severity: "Warning", message: `${nonOriginCount} URLs belong to a different domain origin.`, count: nonOriginCount });
    
    // Check Namespace
    const xmlns = parsed.urlset["@_xmlns"];
    if (!xmlns || !xmlns.includes("sitemaps.org/schemas/sitemap/0.9")) {
      issues.push({ severity: "Warning", message: "Missing or incorrect sitemaps.org namespace.", suggestion: "Add xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" to the urlset." });
    }

    document = { type: "urlset", urls: discoveredUrls };

  } else if (parsed.sitemapindex) {
    // Sitemap Index
    let sitemaps = parsed.sitemapindex.sitemap;
    if (!sitemaps) sitemaps = [];
    if (!Array.isArray(sitemaps)) sitemaps = [sitemaps];

    const sitemapFiles: string[] = [];
    for (const item of sitemaps) {
      if (item.loc && isValidUrl(item.loc)) {
        sitemapFiles.push(item.loc);
      }
    }

    document = { type: "sitemapindex", sitemapFiles };
  } else {
    issues.push({ severity: "Error", message: "Root element must be <urlset> or <sitemapindex>." });
  }

  return {
    health: calculateHealth(issues),
    document
  };
}

function calculateHealth(issues: SitemapIssue[]): SitemapHealthResult {
  let score = 100;
  
  for (const issue of issues) {
    if (issue.severity === "Critical") score -= 50;
    else if (issue.severity === "Error") score -= 25;
    else if (issue.severity === "Warning") score -= 5;
  }
  
  score = Math.max(0, Math.min(100, score));

  let label: SitemapHealthResult["label"] = "Excellent";
  if (score < 50) label = "Critical";
  else if (score < 70) label = "Needs Improvement";
  else if (score < 90) label = "Good";

  return { score, label, issues };
}
