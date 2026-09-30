import * as cheerio from "cheerio";
import { ExtractedPageSignals } from "./types";
import { normalizeUrl } from "../sitemap/url";

export async function extractSignalsFromHtml(
  url: string,
  html: string,
  response: Response,
  originHost: string
): Promise<ExtractedPageSignals> {
  const $ = cheerio.load(html);

  // Status and HTTPS
  const status = response.status;
  const isHttps = url.startsWith("https://");

  // Headers: Only retain security and diagnostic headers.
  // CRITICAL PRIVACY RULE: Never store raw set-cookie, authorization, or user headers.
  const rawHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    rawHeaders[key.toLowerCase()] = value;
  });

  const sanitizedHeaders: Record<string, string> = {};
  const allowedHeaderKeys = [
    "strict-transport-security",
    "content-security-policy",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "server",
    "x-powered-by",
    "x-robots-tag",
    "link",
    "content-type",
  ];

  for (const key of allowedHeaderKeys) {
    if (rawHeaders[key]) {
      sanitizedHeaders[key] = rawHeaders[key];
    }
  }

  // Cookie security inspection (only flag security attributes, never store values)
  const setCookieHeader = rawHeaders["set-cookie"] || "";
  let cookieSignals: ExtractedPageSignals["cookieSignals"] = undefined;
  if (setCookieHeader) {
    const lowerCookie = setCookieHeader.toLowerCase();
    cookieSignals = {
      hasCookies: true,
      allSecure: lowerCookie.includes("secure"),
      allHttpOnly: lowerCookie.includes("httponly"),
      hasSameSite: lowerCookie.includes("samesite"),
    };
  }

  // Redirects logic will be populated from crawler
  const redirects: string[] = [];

  // Canonical Detection (Check HTTP Link header first, then HTML link tag)
  let canonical = "";
  const linkHeader = sanitizedHeaders["link"];
  if (linkHeader) {
    const match = linkHeader.match(/<([^>]+)>;\s*rel="canonical"/i);
    if (match) canonical = match[1];
  }
  if (!canonical) {
    canonical = $("link[rel='canonical']").attr("href") || "";
  }
  if (canonical) {
    try {
      const canonicalAbsolute = new URL(canonical, url).toString();
      canonical = normalizeUrl(canonicalAbsolute) || canonicalAbsolute;
    } catch {}
  }

  // Titles
  const title = $("title").text().trim() || undefined;

  // Headings
  const headings: { level: number; text: string }[] = [];
  const h1s: string[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = (el as any).tagName?.toLowerCase() || "";
    const level = parseInt(tagName.replace("h", ""), 10);
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text && !isNaN(level)) {
      headings.push({ level, text });
      if (level === 1) h1s.push(text);
    }
  });

  // Meta information
  const metaDescription = $("meta[name='description']").attr("content")?.trim();
  const robotsMeta = $("meta[name='robots'], meta[name='googlebot']").attr("content")?.toLowerCase() || undefined;
  
  const xRobots = sanitizedHeaders["x-robots-tag"]?.toLowerCase();
  let finalRobotsMeta = robotsMeta;
  if (xRobots) {
    finalRobotsMeta = finalRobotsMeta ? `${finalRobotsMeta}, ${xRobots}` : xRobots;
  }

  // Internal and External Link Discovery
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  const internalLinks: string[] = [];
  
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    
    // Ignore non-http schemes like mailto:, tel:, javascript:
    const lowerHref = href.trim().toLowerCase();
    if (
      lowerHref.startsWith("javascript:") ||
      lowerHref.startsWith("mailto:") ||
      lowerHref.startsWith("tel:") ||
      lowerHref.startsWith("data:")
    ) {
      return;
    }

    try {
      const absoluteUrl = new URL(href, url);
      if (absoluteUrl.protocol === "http:" || absoluteUrl.protocol === "https:") {
        if (absoluteUrl.hostname.toLowerCase() === originHost.toLowerCase()) {
          internalLinksCount++;
          const norm = normalizeUrl(absoluteUrl.toString());
          if (norm && !internalLinks.includes(norm)) {
            internalLinks.push(norm);
          }
        } else {
          externalLinksCount++;
        }
      }
    } catch {}
  });

  // Schema.org JSON-LD Extraction & Malformed JSON Detection
  const schemas: string[] = [];
  let hasMalformedSchema = false;
  const malformedSchemaDetails: Array<{ snippet: string; error: string }> = [];

  $("script[type='application/ld+json']").each((_, el) => {
    const rawContent = $(el).html();
    if (!rawContent) return;
    const content = rawContent.trim();
    if (!content) return;

    try {
      const parsed = JSON.parse(content);
      const extractType = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (obj["@type"]) {
          if (Array.isArray(obj["@type"])) {
            schemas.push(...obj["@type"]);
          } else {
            schemas.push(String(obj["@type"]));
          }
        }
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          obj["@graph"].forEach(extractType);
        }
      };
      if (Array.isArray(parsed)) {
        parsed.forEach(extractType);
      } else {
        extractType(parsed);
      }
    } catch (err: any) {
      hasMalformedSchema = true;
      malformedSchemaDetails.push({
        snippet: content.length > 120 ? content.slice(0, 120) + "..." : content,
        error: err?.message || "Invalid JSON-LD syntax"
      });
    }
  });

  // Mixed content detection (must run before element removal)
  let hasActiveMixedContent = false;
  let hasPassiveMixedContent = false;
  if (isHttps) {
    $("script[src^='http://'], link[rel='stylesheet'][href^='http://'], iframe[src^='http://']").each(() => {
      hasActiveMixedContent = true;
    });
    $("img[src^='http://'], audio[src^='http://'], video[src^='http://']").each(() => {
      hasPassiveMixedContent = true;
    });
  }
  const hasMixedContent = hasActiveMixedContent || hasPassiveMixedContent;

  // Meaningful visible text approximation
  // Clone or remove non-visible elements to measure text length
  const $bodyClone = cheerio.load($.html());
  $bodyClone("script, style, noscript, svg, img, iframe, object, head").remove();
  const textContent = $bodyClone("body").text().replace(/\s+/g, " ").trim();
  const textLength = textContent.length;

  // Client-Side Rendered (SPA) Shell Detection
  // If visible text is minimal and shell containers like #root or #__next exist
  let isJsRenderedShell = false;
  if (textLength < 300) {
    const hasSpaRoot = $("#root, #__next, #app, [id*='root'], [id*='app']").length > 0;
    const hasScriptTags = html.includes("<script");
    if (hasSpaRoot && hasScriptTags) {
      isJsRenderedShell = true;
    }
  }

  return {
    url,
    status,
    https: isHttps,
    redirects,
    canonical,
    title,
    h1s,
    metaDescription,
    robotsMeta: finalRobotsMeta,
    internalLinksCount,
    internalLinks,
    externalLinksCount,
    headings,
    textLength,
    schemas: Array.from(new Set(schemas)),
    hasMalformedSchema,
    malformedSchemaDetails: malformedSchemaDetails.length > 0 ? malformedSchemaDetails : undefined,
    headers: sanitizedHeaders,
    cookieSignals,
    hasMixedContent,
    hasActiveMixedContent,
    hasPassiveMixedContent,
    isJsRenderedShell,
  };
}
