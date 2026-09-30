import { validateAndNormalizeTargetUrl } from './src/lib/ai-search/url-validation';
import { analyzeScanResults } from './src/lib/ai-search/analyzer';
import { ExtractedPageSignals } from './src/lib/ai-search/types';

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log("✅ PASS:", msg);
  } else {
    console.error("❌ FAIL:", msg);
  }
}

function runTests() {
  console.log("Running AI Search Optimizer Tests...");

  // 1. URL Validation & SSRF
  assert(!validateAndNormalizeTargetUrl("http://localhost").safe, "Rejects localhost");
  assert(!validateAndNormalizeTargetUrl("http://127.0.0.1").safe, "Rejects loopback IP");
  assert(!validateAndNormalizeTargetUrl("http://169.254.169.254").safe, "Rejects cloud metadata IP");
  assert(!validateAndNormalizeTargetUrl("file:///etc/passwd").safe, "Rejects file protocol");
  
  const norm1 = validateAndNormalizeTargetUrl("https://EXAMPLE.com:443/page#frag");
  assert(norm1.safe && norm1.normalizedUrl === "https://example.com/page", "Normalizes HTTPS default port and removes fragments");

  // 2. Score Calculation
  const mockPage: ExtractedPageSignals = {
    url: "https://example.com/",
    status: 200,
    https: true,
    redirects: [],
    canonical: "https://example.com/",
    title: "Example Site",
    h1s: ["Welcome"],
    internalLinksCount: 10,
    internalLinks: [],
    externalLinksCount: 2,
    headings: [{ level: 1, text: "Welcome" }],
    textLength: 500,
    schemas: ["Organization"],
    headers: { 
      "strict-transport-security": "max-age=31536000",
      "content-security-policy": "default-src 'self'",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY"
    },
    hasMixedContent: false,
  };

  const discoveryResult = {
    robotsTxt: "User-agent: *\nAllow: /",
    robotsParsed: null,
    sitemapUrls: ["https://example.com/sitemap.xml"],
    discoveredUrls: []
  };

  const report = analyzeScanResults([mockPage], discoveryResult);
  assert(report.score === 100, "Perfect score for perfect mock page");
  assert(report.issues.length === 0, "No issues for perfect mock page");

  const badPage: ExtractedPageSignals = {
    ...mockPage,
    status: 404,
    https: false,
    canonical: undefined,
    h1s: [],
    textLength: 50,
    schemas: [],
    hasMixedContent: true,
    headers: {}
  };

  const badReport = analyzeScanResults([badPage], { ...discoveryResult, robotsTxt: null, sitemapUrls: [] });
  assert(badReport.score < 50, "Low score for problematic page");
  assert(badReport.issues.some(i => i.code === 'NON_200_STATUS'), "Detects 404 status");
  assert(badReport.issues.some(i => i.code === 'NO_HTTPS'), "Detects missing HTTPS");
  assert(badReport.issues.some(i => i.code === 'ROBOTS_TXT_MISSING'), "Detects missing robots.txt");

  console.log("Tests finished.");
}

runTests();
