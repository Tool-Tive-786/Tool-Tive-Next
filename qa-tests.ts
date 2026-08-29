import { crawlSingleUrl } from './src/lib/sitemap/crawler';
import { normalizeUrl } from './src/lib/sitemap/url';
import { buildSitemaps } from './src/lib/sitemap/xml-serializer';
import { validateAndParseSitemap } from './src/lib/sitemap/validator';

async function runTests() {
  console.log("Running QA tests...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log("✅ PASS:", msg);
      passed++;
    } else {
      console.error("❌ FAIL:", msg);
      failed++;
    }
  }

  // 1. URL Normalization
  assert(normalizeUrl("https://example.com/?utm_source=test") === "https://example.com/", "Strips tracking parameters");
  assert(normalizeUrl("https://example.com/page/") === "https://example.com/page/", "Preserves trailing slash if present");
  assert(normalizeUrl("HTTPS://EXAMPLE.COM/page") === "https://example.com/page", "Normalizes casing");
  
  // 2. XML Generation & Validation
  const urls: any[] = [
    { url: "https://example.com/", normalizedUrl: "https://example.com/", decision: "included" },
    { url: "https://example.com/page", normalizedUrl: "https://example.com/page", decision: "excluded" }, // should not serialize
    { url: "https://example.com/review", normalizedUrl: "https://example.com/review", decision: "needs_review" } // should not serialize
  ];
  
  const xmlResult = buildSitemaps(urls, "https://example.com");
  assert(xmlResult.files.length === 1, "Generates 1 file");
  assert(!xmlResult.files[0].content.includes("example.com/page"), "Excludes 'excluded' decisions");
  assert(!xmlResult.files[0].content.includes("example.com/review"), "Excludes 'needs_review' decisions");
  
  const validation = validateAndParseSitemap(xmlResult.files[0].content, "https://example.com");
  assert(validation.health.score === 100, "XML is healthy and valid");
  
  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
}

runTests();
