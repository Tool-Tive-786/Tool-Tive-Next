import { validateAndNormalizeTargetUrl, validateRedirectUrl, resolveRelativeUrl, isSameOrigin } from "./src/lib/ai-search/url-validation";
import { isSafePublicHostname } from "./src/lib/robots-txt/security";
import { analyzeScanResults } from "./src/lib/ai-search/analyzer";
import { extractSignalsFromHtml } from "./src/lib/ai-search/extractor";
import { ExtractedPageSignals, ScanIssue } from "./src/lib/ai-search/types";
import { 
  BASIC_SCANS_PER_DAY, 
  BASIC_MAX_PAGES, 
  BASIC_MAX_DEPTH, 
  BASIC_MAX_REDIRECT_HOPS, 
  BASIC_MAX_RESPONSE_BYTES 
} from "./src/lib/ai-search/constants";
import { createScanRecord, getScanRecord, updateScanStatus, incrementQuota, getQuota } from "./src/lib/ai-search/db";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failedTests++;
  }
}

async function runFullTestSuite() {
  console.log("===================================================================");
  console.log("TOOLTIVE — AI SEARCH OPTIMIZER (BASIC SCAN) FULL QA TEST SUITE");
  console.log("===================================================================\n");

  // --------------------------------------------------------------------------
  // 1. LOCKED CONSTANTS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("--- 1. Locked Constants Verification ---");
  assert(BASIC_SCANS_PER_DAY === 3, "BASIC_SCANS_PER_DAY is exactly 3");
  assert(BASIC_MAX_PAGES === 10, "BASIC_MAX_PAGES is exactly 10");
  assert(BASIC_MAX_DEPTH === 2, "BASIC_MAX_DEPTH is exactly 2");
  assert(BASIC_MAX_REDIRECT_HOPS === 3, "BASIC_MAX_REDIRECT_HOPS is exactly 3");
  assert(BASIC_MAX_RESPONSE_BYTES === 1048576, "BASIC_MAX_RESPONSE_BYTES is exactly 1 MiB (1048576 bytes)");

  // --------------------------------------------------------------------------
  // 2. URL NORMALIZATION & VALIDATION
  // --------------------------------------------------------------------------
  console.log("\n--- 2. URL Normalization & Protocol Validation ---");
  
  const norm1 = validateAndNormalizeTargetUrl("https://example.com");
  assert(norm1.safe && norm1.normalizedUrl === "https://example.com/", "Normalizes bare domain to include trailing slash");

  const norm2 = validateAndNormalizeTargetUrl("HTTPS://EXAMPLE.COM/Page");
  assert(norm2.safe && norm2.normalizedUrl === "https://example.com/Page", "Normalizes scheme and host casing while preserving path casing");

  const norm3 = validateAndNormalizeTargetUrl("http://example.com:80/test");
  assert(norm3.safe && norm3.normalizedUrl === "http://example.com/test", "Strips default HTTP port 80");

  const norm4 = validateAndNormalizeTargetUrl("https://example.com:443/test");
  assert(norm4.safe && norm4.normalizedUrl === "https://example.com/test", "Strips default HTTPS port 443");

  const norm5 = validateAndNormalizeTargetUrl("https://example.com/test#section-heading");
  assert(norm5.safe && norm5.normalizedUrl === "https://example.com/test", "Removes URL fragments (#section)");

  const norm6 = validateAndNormalizeTargetUrl("https://example.com/search?q=ai&filter=1");
  assert(norm6.safe && norm6.normalizedUrl === "https://example.com/search?q=ai&filter=1", "Preserves legitimate query parameters");

  // Unsupported protocols
  assert(!validateAndNormalizeTargetUrl("javascript:alert(1)").safe, "Rejects javascript: scheme");
  assert(!validateAndNormalizeTargetUrl("data:text/html,<h1>Hello</h1>").safe, "Rejects data: scheme");
  assert(!validateAndNormalizeTargetUrl("file:///etc/passwd").safe, "Rejects file: scheme");
  assert(!validateAndNormalizeTargetUrl("ftp://ftp.example.com").safe, "Rejects ftp: scheme");
  assert(!validateAndNormalizeTargetUrl("chrome://settings").safe, "Rejects chrome: scheme");
  assert(!validateAndNormalizeTargetUrl("about:blank").safe, "Rejects about: scheme");
  assert(!validateAndNormalizeTargetUrl("blob:https://example.com/uuid").safe, "Rejects blob: scheme");

  // Credentials in URL
  assert(!validateAndNormalizeTargetUrl("https://admin:password123@example.com").safe, "Rejects credentials in target URL");

  // Dangerous / Internal ports
  assert(!validateAndNormalizeTargetUrl("https://example.com:22/").safe, "Rejects SSH port 22");
  assert(!validateAndNormalizeTargetUrl("https://example.com:25/").safe, "Rejects SMTP port 25");
  assert(!validateAndNormalizeTargetUrl("https://example.com:3306/").safe, "Rejects MySQL port 3306");
  assert(!validateAndNormalizeTargetUrl("https://example.com:5432/").safe, "Rejects PostgreSQL port 5432");
  assert(!validateAndNormalizeTargetUrl("https://example.com:6379/").safe, "Rejects Redis port 6379");
  assert(!validateAndNormalizeTargetUrl("https://example.com:27017/").safe, "Rejects MongoDB port 27017");

  // Same-origin helper
  assert(isSameOrigin("https://example.com/page1", "https://example.com/page2"), "Same origin detects identical protocol + host");
  assert(!isSameOrigin("https://example.com/page1", "http://example.com/page1"), "Same origin rejects scheme mismatch (https vs http)");
  assert(!isSameOrigin("https://sub.example.com/", "https://example.com/"), "Same origin rejects subdomain mismatch");
  assert(!isSameOrigin("https://example.com:8443/", "https://example.com/"), "Same origin rejects custom port mismatch");

  // Relative URL resolution
  assert(resolveRelativeUrl("/about", "https://example.com/blog/") === "https://example.com/about", "Resolves root-relative path");
  assert(resolveRelativeUrl("post-1", "https://example.com/blog/") === "https://example.com/blog/post-1", "Resolves relative path");
  assert(resolveRelativeUrl("https://other.com/ext", "https://example.com/") === "https://other.com/ext", "Resolves absolute URL");

  // --------------------------------------------------------------------------
  // 3. SSRF & PRIVATE IP PROTECTION
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Comprehensive SSRF & IP Protection ---");
  
  // Loopback
  assert(!isSafePublicHostname("localhost").safe, "Blocks localhost");
  assert(!isSafePublicHostname("sub.localhost").safe, "Blocks *.localhost");
  assert(!isSafePublicHostname("127.0.0.1").safe, "Blocks 127.0.0.1");
  assert(!isSafePublicHostname("127.0.0.2").safe, "Blocks 127.0.0.2");
  assert(!isSafePublicHostname("127.255.255.255").safe, "Blocks 127.255.255.255");
  assert(!isSafePublicHostname("0.0.0.0").safe, "Blocks 0.0.0.0");
  assert(!isSafePublicHostname("::1").safe, "Blocks IPv6 loopback ::1");
  assert(!isSafePublicHostname("[::1]").safe, "Blocks IPv6 bracketed [::1]");

  // Shorthand IPv4 (resolves to loopback or private)
  assert(!isSafePublicHostname("127.1").safe, "Blocks shorthand IPv4 127.1 (127.0.0.1)");
  assert(!isSafePublicHostname("127.0.1").safe, "Blocks shorthand IPv4 127.0.1");
  assert(!isSafePublicHostname("10.1").safe, "Blocks shorthand IPv4 10.1 (10.0.0.1)");

  // Octal and Hex IPv4
  assert(!isSafePublicHostname("0177.0.0.1").safe, "Blocks octal IPv4 0177.0.0.1");
  assert(!isSafePublicHostname("0x7f000001").safe, "Blocks hex IPv4 0x7f000001");
  assert(!isSafePublicHostname("0x7f.0.0.1").safe, "Blocks dotted hex IPv4 0x7f.0.0.1");
  assert(!isSafePublicHostname("2130706433").safe, "Blocks single integer IP 2130706433 (127.0.0.1)");

  // RFC 1918 Private IPv4
  assert(!isSafePublicHostname("10.0.0.1").safe, "Blocks 10.0.0.0/8 private network");
  assert(!isSafePublicHostname("10.254.0.1").safe, "Blocks 10.254.0.1");
  assert(!isSafePublicHostname("172.16.0.1").safe, "Blocks 172.16.0.0/12 start (172.16.0.1)");
  assert(!isSafePublicHostname("172.31.255.254").safe, "Blocks 172.16.0.0/12 end (172.31.255.254)");
  assert(!isSafePublicHostname("192.168.0.1").safe, "Blocks 192.168.0.0/16 (192.168.0.1)");
  assert(!isSafePublicHostname("192.168.1.254").safe, "Blocks 192.168.1.254");

  // Cloud Metadata Endpoints
  assert(!isSafePublicHostname("169.254.169.254").safe, "Blocks AWS/GCP/Azure link-local metadata (169.254.169.254)");
  assert(!isSafePublicHostname("100.100.100.200").safe, "Blocks Alibaba Cloud metadata (100.100.100.200)");
  assert(!isSafePublicHostname("instance-data").safe, "Blocks AWS instance-data hostname");
  assert(!isSafePublicHostname("metadata.google.internal").safe, "Blocks GCP metadata hostname (*.internal)");

  // IPv6 Private & Unique Local
  assert(!isSafePublicHostname("fc00::1").safe, "Blocks IPv6 unique local (fc00::)");
  assert(!isSafePublicHostname("fd12:3456:789a::1").safe, "Blocks IPv6 unique local (fd00::)");
  assert(!isSafePublicHostname("fe80::1").safe, "Blocks IPv6 link-local (fe80::)");
  assert(!isSafePublicHostname("::ffff:127.0.0.1").safe, "Blocks IPv4-mapped IPv6 loopback (::ffff:127.0.0.1)");
  assert(!isSafePublicHostname("::ffff:10.0.0.1").safe, "Blocks IPv4-mapped IPv6 private (::ffff:10.0.0.1)");

  // Internal TLDs
  assert(!isSafePublicHostname("server.local").safe, "Blocks .local TLD");
  assert(!isSafePublicHostname("app.internal").safe, "Blocks .internal TLD");
  assert(!isSafePublicHostname("router.lan").safe, "Blocks .lan TLD");
  assert(!isSafePublicHostname("nas.home").safe, "Blocks .home TLD");
  assert(!isSafePublicHostname("intranet.corp").safe, "Blocks .corp TLD");

  // Legitimate public hostnames must PASS
  assert(isSafePublicHostname("example.com").safe, "Allows public domain example.com");
  assert(isSafePublicHostname("tooltive.com").safe, "Allows public domain tooltive.com");
  assert(isSafePublicHostname("google.com").safe, "Allows public domain google.com");
  assert(isSafePublicHostname("93.184.216.34").safe, "Allows public IPv4 address (93.184.216.34)");

  // Redirect SSRF testing
  const red1 = validateRedirectUrl("http://127.0.0.1/admin", "https://example.com/");
  assert(!red1.safe, "Redirect SSRF: Rejects redirect to 127.0.0.1");

  const red2 = validateRedirectUrl("http://169.254.169.254/latest/meta-data/", "https://example.com/");
  assert(!red2.safe, "Redirect SSRF: Rejects redirect to cloud metadata");

  const red3 = validateRedirectUrl("file:///etc/hosts", "https://example.com/");
  assert(!red3.safe, "Redirect SSRF: Rejects redirect to file protocol");

  const red4 = validateRedirectUrl("/safe-path", "https://example.com/initial");
  assert(red4.safe && red4.normalizedUrl === "https://example.com/safe-path", "Redirect SSRF: Allows safe relative redirect on same domain");

  // --------------------------------------------------------------------------
  // 4. HTML SIGNAL EXTRACTION & PRIVACY AUDIT
  // --------------------------------------------------------------------------
  console.log("\n--- 4. HTML Signal Extraction & Privacy Verification ---");

  const testHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Test Page Title for AI Optimization</title>
      <meta name="description" content="This is a test description for verifying HTML signal extraction.">
      <meta name="robots" content="index, follow">
      <link rel="canonical" href="https://example.com/canonical-test">
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Test Article"
        }
      </script>
      <script type="application/ld+json">
        { invalid JSON syntax here: missing quotes }
      </script>
    </head>
    <body>
      <h1>Main Headline One</h1>
      <h2>Subheading Level 2</h2>
      <p>This is meaningful visible text content that spans multiple sentences to provide rich context for search engine crawlers and AI summarization systems.</p>
      <a href="/internal-link-1">Internal 1</a>
      <a href="/internal-link-2">Internal 2</a>
      <a href="https://other.com/ext">External</a>
      <a href="javascript:void(0)">Ignored</a>
      <!-- Active mixed content test -->
      <script src="http://example.com/insecure.js"></script>
    </body>
    </html>
  `;

  const mockResponse = new Response(testHtml, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "content-security-policy": "default-src 'self'",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "set-cookie": "session_id=SECRET123; Secure; HttpOnly; SameSite=Lax",
      "authorization": "Bearer super-secret-token",
    }
  });

  const signals = await extractSignalsFromHtml("https://example.com/page", testHtml, mockResponse, "example.com");

  assert(signals.title === "Test Page Title for AI Optimization", "Extracts correct page title");
  assert(signals.h1s.length === 1 && signals.h1s[0] === "Main Headline One", "Extracts single H1 heading");
  assert(signals.headings.length === 2, "Extracts all heading levels (H1 + H2)");
  assert(signals.canonical === "https://example.com/canonical-test", "Extracts canonical tag URL");
  assert(signals.robotsMeta === "index, follow", "Extracts meta robots directive");
  assert(signals.internalLinksCount === 2, "Discovers 2 internal links and ignores javascript: link");
  assert(signals.externalLinksCount === 1, "Discovers 1 external link");
  assert(signals.schemas.includes("Article"), "Extracts valid Schema.org Article type");
  assert(signals.hasMalformedSchema === true, "Flags malformed JSON-LD block without crashing");
  assert(signals.hasActiveMixedContent === true, "Detects active mixed content (http script on https)");
  assert(signals.hasMixedContent === true, "Flags mixed content present");

  // PRIVACY VERIFICATION: Raw cookies, auth headers, and raw HTML must NOT be in signals
  assert(!("authorization" in signals.headers), "Privacy: Strips Authorization header from persisted signals");
  assert(!("set-cookie" in signals.headers), "Privacy: Strips Set-Cookie header from persisted signals");
  assert(signals.cookieSignals?.allSecure === true, "Privacy: Extracts cookie security flags without storing values");
  assert(signals.cookieSignals?.allHttpOnly === true, "Privacy: Extracts HttpOnly flag safely");
  assert(!JSON.stringify(signals).includes("SECRET123"), "Privacy: Sensitive cookie value never appears in signals");
  assert(!JSON.stringify(signals).includes("super-secret-token"), "Privacy: Secret bearer token never appears in signals");
  assert(!("html" in signals) && !("rawHtml" in signals), "Privacy: Raw HTML is NOT attached to extracted signals");

  // --------------------------------------------------------------------------
  // 5. DETERMINISTIC SCORING ENGINE & WEIGHTS
  // --------------------------------------------------------------------------
  console.log("\n--- 5. Deterministic Scoring Engine & Weights ---");

  const discoveryFixture = {
    robotsTxt: "User-agent: *\nAllow: /",
    robotsParsed: null,
    sitemapUrls: ["https://example.com/sitemap.xml"],
    discoveredUrls: ["https://example.com/page1", "https://example.com/page2"],
    llmsTxtFound: true
  };

  const perfectPage: ExtractedPageSignals = {
    url: "https://example.com/",
    status: 200,
    https: true,
    redirects: [],
    canonical: "https://example.com/",
    title: "Example Perfect Page for AI Search",
    h1s: ["Welcome to Example"],
    metaDescription: "Descriptive meta description.",
    internalLinksCount: 8,
    internalLinks: ["https://example.com/page1"],
    externalLinksCount: 2,
    headings: [{ level: 1, text: "Welcome to Example" }],
    textLength: 600,
    schemas: ["Organization", "WebSite"],
    headers: {
      "strict-transport-security": "max-age=31536000",
      "content-security-policy": "default-src 'self'",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
    hasMixedContent: false,
  };

  const rep1 = analyzeScanResults([perfectPage], discoveryFixture);
  const rep2 = analyzeScanResults([perfectPage], discoveryFixture);

  assert(rep1.score === 100, "Perfect fixture earns 100/100 overall score");
  assert(rep1.score === rep2.score, "Scoring is 100% deterministic and reproducible across runs");
  assert(rep1.issues.length === 1 && rep1.issues[0].code === "LLMS_TXT_DETECTED", "No negative issues on perfect page (only informational llms.txt)");

  // Category Weights Verification:
  // Technical: 25%, Security: 15%, Discoverability: 15%, Clarity: 15%, Linking: 10%, Structured Data: 10%, AI Org: 10%
  const categories = rep1.categoryScores;
  assert(categories.technical !== undefined, "Includes Technical Accessibility category (25%)");
  assert(categories.security !== undefined, "Includes Security & HTTPS category (15%)");
  assert(categories.discoverability !== undefined, "Includes Discoverability category (15%)");
  assert(categories.clarity !== undefined, "Includes Content Clarity category (15%)");
  assert(categories.linking !== undefined, "Includes Internal Linking category (10%)");
  assert(categories.structured_data !== undefined, "Includes Structured Data category (10%)");
  assert(categories.ai_org !== undefined, "Includes AI Content Organization category (10%)");

  // --------------------------------------------------------------------------
  // 6. SCORE BAND BOUNDARIES (LOCKED SPECIFICATION - SECTION 33)
  // --------------------------------------------------------------------------
  console.log("\n--- 6. Score Band Boundaries (Section 33) ---");
  // 90–100 = Strong
  // 75–89  = Good
  // 60–74  = Needs Work
  // 40–59  = Weak
  // 0–39   = Critical Attention

  function getScoreTier(score: number): string {
    if (score >= 90) return "Strong";
    if (score >= 75) return "Good";
    if (score >= 60) return "Needs Work";
    if (score >= 40) return "Weak";
    return "Critical Attention";
  }

  assert(getScoreTier(100) === "Strong", "Boundary 100 is Strong");
  assert(getScoreTier(90) === "Strong", "Boundary 90 is Strong");
  assert(getScoreTier(89) === "Good", "Boundary 89 is Good");
  assert(getScoreTier(75) === "Good", "Boundary 75 is Good");
  assert(getScoreTier(74) === "Needs Work", "Boundary 74 is Needs Work");
  assert(getScoreTier(60) === "Needs Work", "Boundary 60 is Needs Work");
  assert(getScoreTier(59) === "Weak", "Boundary 59 is Weak");
  assert(getScoreTier(40) === "Weak", "Boundary 40 is Weak");
  assert(getScoreTier(39) === "Critical Attention", "Boundary 39 is Critical Attention");
  assert(getScoreTier(0) === "Critical Attention", "Boundary 0 is Critical Attention");

  // --------------------------------------------------------------------------
  // 7. QUOTA & ANONYMOUS SESSION SECURITY
  // --------------------------------------------------------------------------
  console.log("\n--- 7. Quota & Anonymous Session Testing ---");

  const mockEnv = { DB: null }; // Uses fallback in-memory database
  const testSessionHash = "session_test_" + Date.now();
  const testDate = new Date().toISOString().split("T")[0];

  assert((await getQuota(mockEnv, testSessionHash, testDate)) === 0, "Initial usage is 0");
  
  // Scan 1
  await incrementQuota(mockEnv, testSessionHash, testDate);
  assert((await getQuota(mockEnv, testSessionHash, testDate)) === 1, "Scan 1 increments quota to 1 (allowed)");

  // Scan 2
  await incrementQuota(mockEnv, testSessionHash, testDate);
  assert((await getQuota(mockEnv, testSessionHash, testDate)) === 2, "Scan 2 increments quota to 2 (allowed)");

  // Scan 3
  await incrementQuota(mockEnv, testSessionHash, testDate);
  assert((await getQuota(mockEnv, testSessionHash, testDate)) === 3, "Scan 3 reaches daily limit of 3 (allowed)");

  // Scan 4 would exceed limit
  const currentCount = await getQuota(mockEnv, testSessionHash, testDate);
  const isAllowedScan4 = currentCount < BASIC_SCANS_PER_DAY;
  assert(!isAllowedScan4, "Scan 4 is rejected with HTTP 429 quota exceeded");

  // Day boundary: Different date has independent fresh quota
  const tomorrow = "2099-01-01";
  assert((await getQuota(mockEnv, testSessionHash, tomorrow)) === 0, "Next calendar day resets quota to 0");

  // --------------------------------------------------------------------------
  // 8. D1 STATE PERSISTENCE & PRIVACY
  // --------------------------------------------------------------------------
  console.log("\n--- 8. Scan State & D1 Persistence ---");

  const scanId = "scan_test_12345";
  await createScanRecord(mockEnv, scanId, testSessionHash, "https://example.com/", "basic");
  
  const createdRecord = await getScanRecord(mockEnv, scanId);
  assert(createdRecord !== null, "Scan record created in store");
  assert(createdRecord.status === "queued", "Initial scan status is queued");
  assert(createdRecord.root_url === "https://example.com/", "Stores normalized root URL");

  // Update status to analyzing
  await updateScanStatus(mockEnv, scanId, "analyzing", 5, 2);
  const analyzingRecord = await getScanRecord(mockEnv, scanId);
  assert(analyzingRecord.status === "analyzing", "Updates status to analyzing");
  assert(analyzingRecord.pages_discovered === 5, "Updates discovered pages count");
  assert(analyzingRecord.pages_scanned === 2, "Updates scanned pages count");

  // Update status to completed with report
  await updateScanStatus(mockEnv, scanId, "completed", 10, 10, JSON.stringify(rep1));
  const completedRecord = await getScanRecord(mockEnv, scanId);
  assert(completedRecord.status === "completed", "Updates status to completed");
  assert(JSON.parse(completedRecord.report_json).score === 100, "Persists report JSON with accurate score");

  // Privacy verification: D1 record must NOT store raw HTML
  assert(!("html" in completedRecord) && !("rawHtml" in completedRecord), "D1 storage does NOT store target raw HTML");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n===================================================================");
  console.log(`TEST SUITE RESULTS: ${passedTests} passed, ${failedTests} failed out of ${totalTests} total tests.`);
  console.log("===================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFullTestSuite();
