import { ExtractedPageSignals, ScanIssue, IssueSeverity } from "./types";
import { DiscoveryResult } from "./discovery";

export interface ScannedPageSummary {
  url: string;
  status: number;
  title?: string;
  h1?: string;
  wordCount: number;
  schemas: string[];
}

export interface AnalyzerResult {
  score: number;
  issues: ScanIssue[];
  categoryScores: Record<string, { earned: number; applicable: number }>;
  pagesSummary?: ScannedPageSummary[];
}

export function analyzeScanResults(
  pages: ExtractedPageSignals[],
  discovery: DiscoveryResult
): AnalyzerResult {
  const issues: ScanIssue[] = [];
  const categories: Record<string, { earned: number; applicable: number }> = {
    technical: { earned: 0, applicable: 0 },
    security: { earned: 0, applicable: 0 },
    discoverability: { earned: 0, applicable: 0 },
    clarity: { earned: 0, applicable: 0 },
    linking: { earned: 0, applicable: 0 },
    structured_data: { earned: 0, applicable: 0 },
    ai_org: { earned: 0, applicable: 0 },
  };

  function addPoint(category: string, earned: number, max: number) {
    if (categories[category]) {
      categories[category].earned += earned;
      categories[category].applicable += max;
    }
  }

  function issue(
    category: string,
    code: string,
    severity: IssueSeverity,
    title: string,
    whatFound: string,
    whyItMatters: string,
    recommendation: string,
    evidence: any,
    pageUrl?: string
  ) {
    issues.push({ category, code, severity, title, whatFound, whyItMatters, recommendation, evidence, pageUrl });
  }

  // 1. Evaluate Site-Wide Properties (Discovery)
  if (discovery.robotsTxt) {
    addPoint("technical", 5, 5);
  } else {
    addPoint("technical", 0, 5);
    issue(
      "technical",
      "ROBOTS_TXT_MISSING",
      "important",
      "Missing robots.txt",
      "No robots.txt file was found or it returned an error status.",
      "Crawlers and AI agents use robots.txt to identify allowed crawl pathways and site boundaries.",
      "Create a valid robots.txt file at the root of your domain (e.g. /robots.txt).",
      {}
    );
  }

  if (discovery.sitemapUrls && discovery.sitemapUrls.length > 0) {
    addPoint("discoverability", 5, 5);
  } else {
    addPoint("discoverability", 0, 5);
    issue(
      "discoverability",
      "SITEMAP_MISSING",
      "important",
      "Missing XML Sitemap",
      "No XML sitemap was discovered automatically or declared in robots.txt.",
      "Sitemaps help search crawlers and AI search systems index all your important URLs reliably.",
      "Generate an XML sitemap and reference it in your robots.txt file.",
      {}
    );
  }

  // Optional Ecosystem Signal: llms.txt
  if (discovery.llmsTxtFound) {
    addPoint("ai_org", 5, 5);
    issue(
      "ai_org",
      "LLMS_TXT_DETECTED",
      "info",
      "Optional llms.txt File Detected",
      "Site provides an llms.txt file at the domain root.",
      "llms.txt is an emerging convention that helps AI models quickly consume structured markdown summaries.",
      "Keep your llms.txt updated with key documentation and content links.",
      { llmsTxt: true }
    );
  } else {
    addPoint("ai_org", 5, 5); // Optional: do not penalize if missing, per specification
  }

  // 2. Evaluate Per-Page Signals
  pages.forEach((page) => {
    // Technical Accessibility: HTTP Status
    if (page.status >= 200 && page.status < 300) {
      addPoint("technical", 10, 10);
    } else {
      addPoint("technical", 0, 10);
      issue(
        "technical",
        "NON_200_STATUS",
        "critical",
        "Page returned non-200 status",
        `Page returned HTTP ${page.status}.`,
        "Search engines and AI bots cannot index or process pages that return error response codes.",
        "Ensure the server returns a 200 OK status code for all public indexable pages.",
        { status: page.status },
        page.url
      );
    }

    // Canonical Tag Evaluation
    if (page.canonical) {
      const pageNorm = page.url.replace(/\/$/, "");
      const canonNorm = page.canonical.replace(/\/$/, "");
      if (canonNorm === pageNorm) {
        addPoint("technical", 5, 5);
      } else {
        addPoint("technical", 2, 5);
        issue(
          "technical",
          "CANONICAL_MISMATCH",
          "important",
          "Canonical URL Points to Different URL",
          `Canonical tag points to ${page.canonical} instead of the current page URL.`,
          "A non-self-referencing canonical instructs search engines to prioritize the specified canonical URL over this one.",
          "Verify whether this page is intended to be canonicalized to another URL, or update the canonical tag to self-reference.",
          { canonical: page.canonical, currentUrl: page.url },
          page.url
        );
      }
    } else {
      addPoint("technical", 0, 5);
      issue(
        "technical",
        "CANONICAL_MISSING",
        "opportunity",
        "Missing Canonical Tag",
        'No rel="canonical" link tag or Link header found on this page.',
        "Canonical tags help search engines avoid duplicate content issues when URLs have query parameters or trailing slash variations.",
        "Add a rel=\"canonical\" tag in the <head> pointing to the preferred URL version of this page.",
        {},
        page.url
      );
    }

    // Meta Robots / Indexing Directives
    if (page.robotsMeta) {
      const lowerMeta = page.robotsMeta.toLowerCase();
      if (lowerMeta.includes("noindex")) {
        issue(
          "technical",
          "ROBOTS_NOINDEX",
          "info",
          "Page Specifies noindex Directive",
          `Robots directive "${page.robotsMeta}" instructs crawlers not to index this page.`,
          "Search engines and AI crawlers respect noindex and will exclude this page from search results.",
          "If this page is intended for public search discovery, remove the noindex directive; otherwise, ignore this note if exclusion is deliberate.",
          { robotsMeta: page.robotsMeta },
          page.url
        );
      }
    }

    // Security & HTTPS
    if (page.https) {
      addPoint("security", 10, 10);
    } else {
      addPoint("security", 0, 10);
      issue(
        "security",
        "NO_HTTPS",
        "critical",
        "Insecure HTTP Connection",
        "The page was requested or served over unencrypted HTTP.",
        "HTTPS is an essential security baseline and a search ranking signal. AI agents strongly prioritize encrypted sources.",
        "Install an SSL/TLS certificate and configure an HTTP-to-HTTPS 301 redirect on your server.",
        {},
        page.url
      );
    }

    // Mixed Content
    if (page.hasMixedContent) {
      addPoint("security", 0, 5);
      if (page.hasActiveMixedContent) {
        issue(
          "security",
          "ACTIVE_MIXED_CONTENT",
          "important",
          "Active Mixed Content Detected",
          "HTTPS page loads active executable resources (scripts, stylesheets, or iframes) over insecure HTTP.",
          "Active mixed content undermines HTTPS security because insecure scripts can be intercepted or manipulated in transit.",
          "Update all script, stylesheet, and iframe URLs to use HTTPS.",
          { hasActiveMixedContent: true },
          page.url
        );
      } else {
        issue(
          "security",
          "PASSIVE_MIXED_CONTENT",
          "opportunity",
          "Passive Mixed Content Detected",
          "HTTPS page loads passive media resources (images, audio, or video) over insecure HTTP.",
          "While less dangerous than active scripts, passive mixed content displays browser security warnings and degrades user trust.",
          "Update image, audio, and video URLs to use HTTPS.",
          { hasPassiveMixedContent: true },
          page.url
        );
      }
    } else {
      addPoint("security", 5, 5);
    }

    // Security Headers: HSTS
    const hsts = page.headers["strict-transport-security"];
    if (hsts) {
      addPoint("security", 2, 2);
    } else {
      issue(
        "security",
        "MISSING_HSTS",
        "info",
        "Missing HSTS Header",
        "Strict-Transport-Security response header is not configured.",
        "HSTS instructs browsers to always connect via HTTPS, preventing SSL stripping attacks.",
        "Configure the Strict-Transport-Security header (e.g. max-age=31536000; includeSubDomains) on your web server.",
        {},
        page.url
      );
    }

    // Security Headers: CSP (Hardening advisory, NOT critical)
    const csp = page.headers["content-security-policy"];
    if (!csp) {
      issue(
        "security",
        "MISSING_CSP",
        "info",
        "Content-Security-Policy (CSP) Not Present",
        "No Content-Security-Policy response header was detected.",
        "CSP provides defense-in-depth against cross-site scripting (XSS) and data injection attacks.",
        "Consider implementing a Content-Security-Policy header suited to your application needs.",
        {},
        page.url
      );
    }

    // Security Headers: X-Content-Type-Options
    const xcto = page.headers["x-content-type-options"];
    if (!xcto || !xcto.toLowerCase().includes("nosniff")) {
      issue(
        "security",
        "MISSING_XCTO",
        "info",
        "Missing X-Content-Type-Options Header",
        'The X-Content-Type-Options header is missing or not set to "nosniff".',
        "Setting X-Content-Type-Options to nosniff prevents browsers from MIME-sniffing responses away from the declared content-type.",
        'Add "X-Content-Type-Options: nosniff" to server response headers.',
        {},
        page.url
      );
    }

    // Security Headers: X-Frame-Options
    const xfo = page.headers["x-frame-options"];
    if (!xfo && !csp) {
      issue(
        "security",
        "MISSING_XFO",
        "info",
        "Missing Clickjacking Protection Header",
        "Neither X-Frame-Options nor CSP frame-ancestors was detected.",
        "Clickjacking protection prevents third-party sites from framing your content in malicious overlay attacks.",
        'Add "X-Frame-Options: SAMEORIGIN" or "X-Frame-Options: DENY" to server headers.',
        {},
        page.url
      );
    }

    // Security: Server Header Information Leakage
    const serverHeader = page.headers["server"];
    const poweredBy = page.headers["x-powered-by"];
    if ((serverHeader && /\d+\.\d+/.test(serverHeader)) || poweredBy) {
      issue(
        "security",
        "SERVER_HEADER_LEAK",
        "info",
        "Server Software Versions Disclosed",
        `Response headers expose software version details: ${[serverHeader ? `Server: ${serverHeader}` : "", poweredBy ? `X-Powered-By: ${poweredBy}` : ""].filter(Boolean).join(", ")}.`,
        "Exposing exact backend version numbers helps automated scanners target known component vulnerabilities.",
        "Configure your server or reverse proxy to omit detailed version banners from headers.",
        { server: serverHeader, xPoweredBy: poweredBy },
        page.url
      );
    }

    // Cookie Security Flags
    if (page.cookieSignals && page.cookieSignals.hasCookies) {
      if (!page.cookieSignals.allSecure && page.https) {
        issue(
          "security",
          "COOKIE_MISSING_SECURE",
          "important",
          "Cookie Set Without Secure Flag",
          "One or more cookies were set without the Secure attribute over an HTTPS connection.",
          "The Secure flag ensures cookies are only transmitted over encrypted connections.",
          "Add the Secure flag to all Set-Cookie directives.",
          {},
          page.url
        );
      }
      if (!page.cookieSignals.allHttpOnly) {
        issue(
          "security",
          "COOKIE_MISSING_HTTPONLY",
          "info",
          "Cookie Set Without HttpOnly Flag",
          "One or more cookies were set without the HttpOnly attribute.",
          "The HttpOnly flag protects sensitive session cookies from being accessed by client-side scripts.",
          "Add the HttpOnly flag to sensitive session authentication cookies.",
          {},
          page.url
        );
      }
    }

    // Content Clarity: Title
    if (page.title && page.title.length >= 10 && page.title.length <= 70) {
      addPoint("clarity", 5, 5);
    } else if (page.title && page.title.length > 0) {
      addPoint("clarity", 3, 5);
      issue(
        "clarity",
        "SUBOPTIMAL_TITLE_LENGTH",
        "opportunity",
        page.title.length < 10 ? "Title Tag Is Very Short" : "Title Tag May Be Truncated",
        `Page title is ${page.title.length} characters: "${page.title}".`,
        "Clear, descriptive titles between 10 and 60 characters provide optimal topical clarity for search engines and AI models.",
        "Refine the title tag to clearly summarize the specific topic of this page.",
        { title: page.title, length: page.title.length },
        page.url
      );
    } else {
      addPoint("clarity", 0, 5);
      issue(
        "clarity",
        "BAD_TITLE",
        "important",
        "Missing Title Tag",
        "The page does not have a <title> tag in the HTML head.",
        "Titles are one of the most fundamental signals search engines and AI models use to identify page topics.",
        "Add a descriptive <title> tag inside the <head> element.",
        {},
        page.url
      );
    }

    // Content Clarity: H1 Headings
    if (page.h1s.length === 1) {
      addPoint("clarity", 5, 5);
    } else if (page.h1s.length === 0) {
      addPoint("clarity", 0, 5);
      issue(
        "clarity",
        "NO_H1",
        "important",
        "Missing H1 Heading",
        "No <h1> heading was found on this page.",
        "The H1 heading establishes the primary topic for human readers, search engines, and AI extraction systems.",
        "Add exactly one clear, descriptive <h1> heading to the main content area.",
        {},
        page.url
      );
    } else {
      addPoint("clarity", 3, 5);
      issue(
        "clarity",
        "MULTIPLE_H1",
        "opportunity",
        "Multiple H1 Headings Found",
        `Found ${page.h1s.length} <h1> headings on this page.`,
        "While valid in HTML5, having a single prominent H1 heading provides clearer topical focus for AI entity extraction.",
        "Consider consolidating multiple H1 headings into a single primary H1, using H2/H3 for subsections.",
        { h1s: page.h1s },
        page.url
      );
    }

    // Content Clarity & AI Organization: Meaningful Visible Text
    if (page.textLength >= 300) {
      addPoint("clarity", 10, 10);
      addPoint("ai_org", 5, 5);
    } else {
      addPoint("clarity", 2, 10);
      addPoint("ai_org", 0, 5);
      issue(
        "clarity",
        "THIN_CONTENT",
        "important",
        "Minimal Server-Rendered Text Content",
        `Extracted only ~${page.textLength} characters of visible text in the initial server HTML.`,
        "Pages with very little textual content are difficult for AI models to synthesize, categorize, or cite.",
        "Provide more substantive, well-structured text content on this page.",
        { textLength: page.textLength },
        page.url
      );
    }

    // JS-Rendered Single-Page App (SPA) Diagnostic
    if (page.isJsRenderedShell) {
      issue(
        "clarity",
        "JS_CLIENT_RENDERED",
        "info",
        "Client-Side JavaScript Rendering Detected",
        "The initial HTML response appears to be a lightweight JavaScript shell with minimal server-rendered text.",
        "The Basic Scan audits server-rendered HTML. AI crawlers and search bots that do not execute client-side JavaScript will only see this initial shell.",
        "Consider implementing Server-Side Rendering (SSR) or Static Site Generation (SSG) for public content pages.",
        { isJsRenderedShell: true },
        page.url
      );
    }

    // Internal Linking Structure
    if (page.internalLinksCount >= 5) {
      addPoint("linking", 10, 10);
    } else if (page.internalLinksCount > 0) {
      addPoint("linking", 6, 10);
      issue(
        "linking",
        "FEW_INTERNAL_LINKS",
        "opportunity",
        "Few Internal Links Found",
        `Only ${page.internalLinksCount} internal links discovered on this page.`,
        "Internal links connect related content, help crawlers discover sub-pages, and establish contextual hierarchy.",
        "Add contextual internal links to relevant guides, articles, or related tools on your site.",
        { internalLinksCount: page.internalLinksCount },
        page.url
      );
    } else {
      addPoint("linking", 2, 10);
      issue(
        "linking",
        "LOW_INTERNAL_LINKS",
        "opportunity",
        "No Internal Links Found",
        "No same-origin internal links were found in the HTML of this page.",
        "Pages without internal links create dead ends for crawlers and reduce site-wide discoverability.",
        "Add navigation links or contextual internal links to other pages on your domain.",
        { internalLinksCount: 0 },
        page.url
      );
    }

    // Structured Data: Schema.org JSON-LD
    if (page.schemas && page.schemas.length > 0) {
      addPoint("structured_data", 10, 10);
      addPoint("ai_org", 5, 5);
    } else {
      addPoint("structured_data", 0, 10);
      addPoint("ai_org", 0, 5);
      issue(
        "structured_data",
        "NO_SCHEMA",
        "opportunity",
        "No Schema.org Structured Data Detected",
        "No Schema.org JSON-LD script blocks were found on this page.",
        "Structured data provides machine-readable entity definitions that help AI search engines parse facts, products, FAQs, and articles accurately.",
        "Add relevant Schema.org JSON-LD markup (such as WebPage, Article, Organization, or FAQPage).",
        {},
        page.url
      );
    }

    // Malformed Structured Data Detection
    if (page.hasMalformedSchema && page.malformedSchemaDetails) {
      issue(
        "structured_data",
        "MALFORMED_JSON_LD",
        "important",
        "Malformed JSON-LD Syntax Detected",
        `Encountered ${page.malformedSchemaDetails.length} JSON syntax error(s) inside application/ld+json script tags.`,
        "Syntax errors cause search engines and AI parsers to completely discard the structured data block.",
        "Validate your JSON-LD syntax using a JSON validator to fix missing quotes, commas, or unescaped characters.",
        { errors: page.malformedSchemaDetails },
        page.url
      );
    }
  });

  // 3. Overall Deterministic Score Calculation
  // Locked Weights:
  // Technical Accessibility: 25%
  // Security & HTTPS:        15%
  // Content Discoverability: 15%
  // Content Clarity:         15%
  // Internal Linking:        10%
  // Structured Data:         10%
  // AI Content Organization: 10%
  // Total:                  100%
  const weights: Record<string, number> = {
    technical: 0.25,
    security: 0.15,
    discoverability: 0.15,
    clarity: 0.15,
    linking: 0.10,
    structured_data: 0.10,
    ai_org: 0.10,
  };

  let totalScore = 0;
  for (const [key, category] of Object.entries(categories)) {
    if (category.applicable > 0) {
      const catScore = (category.earned / category.applicable) * 100;
      totalScore += catScore * (weights[key] || 0);
    }
  }

  // Ensure score is bounded between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  const pagesSummary: ScannedPageSummary[] = pages.map((p) => ({
    url: p.url,
    status: p.status,
    title: p.title,
    h1: p.h1s && p.h1s.length > 0 ? p.h1s[0] : undefined,
    wordCount: Math.max(1, Math.round(p.textLength / 5)),
    schemas: p.schemas || [],
  }));

  return {
    score: finalScore,
    issues: deduplicateAndSortIssues(issues),
    categoryScores: categories,
    pagesSummary,
  };
}

function deduplicateAndSortIssues(issues: ScanIssue[]): ScanIssue[] {
  const uniqueIssues = new Map<string, ScanIssue>();

  for (const item of issues) {
    const key = item.pageUrl ? `${item.code}_${item.pageUrl}` : item.code;
    if (!uniqueIssues.has(key)) {
      uniqueIssues.set(key, item);
    }
  }

  const severityOrder: Record<IssueSeverity, number> = {
    critical: 1,
    important: 2,
    opportunity: 3,
    info: 4,
  };

  return Array.from(uniqueIssues.values()).sort((a, b) => {
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
