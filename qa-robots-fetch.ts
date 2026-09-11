import { POST } from "./src/app/api/robots-txt/fetch/route";
import {
  validateRobotsFetchUrl,
  validateRobotsRedirectUrl,
  checkRobotsFetchRateLimit
} from "./src/lib/robots-txt/security";

async function runRobotsFetchTestSuite() {
  console.log("=================================================");
  console.log("TOOLTIVE — LIVE ROBOTS.TXT FETCH API QA SUITE");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // 1. INPUT & SSRF VALIDATION TESTS
  // -------------------------------------------------------------
  {
    // Valid public URLs normalized to <origin>/robots.txt
    const v1 = validateRobotsFetchUrl("https://example.com");
    assert(v1.safe && v1.normalizedUrl === "https://example.com/robots.txt", "SSRF 1: Normalizes bare origin to /robots.txt");

    const v2 = validateRobotsFetchUrl("https://example.com/some/deep/path?query=1");
    assert(v2.safe && v2.normalizedUrl === "https://example.com/robots.txt", "SSRF 2: Normalizes arbitrary deep path to /robots.txt (prevents proxy abuse)");

    const v3 = validateRobotsFetchUrl("http://sub.domain.org/");
    assert(v3.safe && v3.normalizedUrl === "http://sub.domain.org/robots.txt", "SSRF 3: Accepts http subdomain and strips trailing slash before adding /robots.txt");

    // Localhost & Loopback
    assert(!validateRobotsFetchUrl("http://localhost").safe, "SSRF 4: Rejects localhost");
    assert(!validateRobotsFetchUrl("http://localhost:8080/robots.txt").safe, "SSRF 5: Rejects localhost with port");
    assert(!validateRobotsFetchUrl("http://127.0.0.1/robots.txt").safe, "SSRF 6: Rejects 127.0.0.1 loopback");
    assert(!validateRobotsFetchUrl("http://127.0.0.2/robots.txt").safe, "SSRF 7: Rejects 127.0.0.2 in loopback subnet");
    assert(!validateRobotsFetchUrl("http://0.0.0.0/robots.txt").safe, "SSRF 8: Rejects 0.0.0.0");

    // Private RFC 1918
    assert(!validateRobotsFetchUrl("http://10.0.0.1/").safe, "SSRF 9: Rejects 10.0.0.0/8");
    assert(!validateRobotsFetchUrl("http://172.16.0.1/").safe, "SSRF 10: Rejects 172.16.0.0/12 lower bound");
    assert(!validateRobotsFetchUrl("http://172.31.255.255/").safe, "SSRF 11: Rejects 172.16.0.0/12 upper bound");
    assert(!validateRobotsFetchUrl("http://192.168.1.1/").safe, "SSRF 12: Rejects 192.168.0.0/16");

    // Cloud Metadata
    assert(!validateRobotsFetchUrl("http://169.254.169.254/").safe, "SSRF 13: Rejects AWS/GCP/Azure link-local metadata 169.254.169.254");
    assert(!validateRobotsFetchUrl("http://100.100.100.200/").safe, "SSRF 14: Rejects Alibaba Cloud metadata 100.100.100.200");

    // Integer / Hex / Octal bypass tricks
    assert(!validateRobotsFetchUrl("http://2130706433/").safe, "SSRF 15: Rejects integer-encoded IP (2130706433 = 127.0.0.1)");
    assert(!validateRobotsFetchUrl("http://0x7f000001/").safe, "SSRF 16: Rejects hexadecimal IP (0x7f000001 = 127.0.0.1)");
    assert(!validateRobotsFetchUrl("http://0177.0.0.1/").safe, "SSRF 17: Rejects octal-formatted IP");

    // IPv6 Loopback & Local
    assert(!validateRobotsFetchUrl("http://[::1]/").safe, "SSRF 18: Rejects IPv6 loopback [::1]");
    assert(!validateRobotsFetchUrl("http://[fc00::1]/").safe, "SSRF 19: Rejects IPv6 unique-local fc00::");
    assert(!validateRobotsFetchUrl("http://[fe80::1]/").safe, "SSRF 20: Rejects IPv6 link-local fe80::");

    // Credentials & Malformed Protocols
    assert(!validateRobotsFetchUrl("https://admin:secret@example.com/").safe, "SSRF 21: Rejects credentials in URL");
    assert(!validateRobotsFetchUrl("file:///etc/passwd").safe, "SSRF 22: Rejects file:// scheme");
    assert(!validateRobotsFetchUrl("javascript:alert(1)").safe, "SSRF 23: Rejects javascript: scheme");
    assert(!validateRobotsFetchUrl("data:text/plain,hello").safe, "SSRF 24: Rejects data: scheme");
    assert(!validateRobotsFetchUrl("ftp://ftp.example.com/").safe, "SSRF 25: Rejects ftp:// scheme");
  }

  // -------------------------------------------------------------
  // 2. REDIRECT VALIDATION & PATH CONFINEMENT
  // -------------------------------------------------------------
  {
    const orig = "https://example.com/robots.txt";

    // Valid redirects staying on robots.txt resource
    const r1 = validateRobotsRedirectUrl("https://www.example.com/robots.txt", orig);
    assert(r1.safe, "Redirect 1: Accepts valid redirect to https://www.example.com/robots.txt");

    const r2 = validateRobotsRedirectUrl("http://cdn.example.com/static/robots.txt", orig);
    assert(r2.safe, "Redirect 2: Accepts valid redirect ending in robots.txt");

    // Unsafe redirects (SSRF attempts via redirect)
    const r3 = validateRobotsRedirectUrl("http://127.0.0.1/robots.txt", orig);
    assert(!r3.safe, "Redirect 3: Rejects redirect to loopback 127.0.0.1");

    const r4 = validateRobotsRedirectUrl("http://169.254.169.254/latest/meta-data", orig);
    assert(!r4.safe, "Redirect 4: Rejects redirect to cloud metadata");

    // Escaping robots.txt context (open proxy attempt)
    const r5 = validateRobotsRedirectUrl("https://example.com/admin/dashboard", orig);
    assert(!r5.safe, "Redirect 5: Rejects redirect leaving robots.txt context (/admin/dashboard)");

    const r6 = validateRobotsRedirectUrl("https://example.com/login", orig);
    assert(!r6.safe, "Redirect 6: Rejects redirect to login page");

    const r7 = validateRobotsRedirectUrl("https://user:pass@example.com/robots.txt", orig);
    assert(!r7.safe, "Redirect 7: Rejects redirect destination containing credentials");
  }

  // -------------------------------------------------------------
  // 3. EDGE RATE LIMITER TESTS
  // -------------------------------------------------------------
  {
    const testClient = `test-ip-${Date.now()}`;

    // First 10 requests should be allowed
    let allAllowed = true;
    for (let i = 0; i < 10; i++) {
      const check = checkRobotsFetchRateLimit(testClient);
      if (!check.allowed) allAllowed = false;
    }
    assert(allAllowed, "RateLimiter 1: Allows up to 10 requests in the window");

    // 11th request must be blocked
    const eleventh = checkRobotsFetchRateLimit(testClient);
    assert(!eleventh.allowed && eleventh.remaining === 0, "RateLimiter 2: Blocks 11th request with 429 semantics");
    assert(eleventh.resetMs > 0, "RateLimiter 3: Returns positive resetMs cooldown");
  }

  // -------------------------------------------------------------
  // 4. API ROUTE POST HANDLER TESTS (Edge Request/Response)
  // -------------------------------------------------------------
  {
    // Test: Missing URL
    const reqNoUrl = new Request("https://tooltive.com/api/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const resNoUrl = await POST(reqNoUrl);
    const jsonNoUrl = await resNoUrl.json();
    assert(resNoUrl.status === 400 && jsonNoUrl.error?.code === "MISSING_URL", "API 1: Returns 400 on missing URL");

    // Test: Invalid JSON
    const reqBadJson = new Request("https://tooltive.com/api/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not json "
    });
    const resBadJson = await POST(reqBadJson);
    const jsonBadJson = await resBadJson.json();
    assert(resBadJson.status === 400 && jsonBadJson.error?.code === "INVALID_JSON", "API 2: Returns 400 on invalid JSON");

    // Test: SSRF Blocked (Private IP)
    const reqPrivate = new Request("https://tooltive.com/api/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://192.168.1.1/robots.txt" })
    });
    const resPrivate = await POST(reqPrivate);
    const jsonPrivate = await resPrivate.json();
    assert(resPrivate.status === 403 && jsonPrivate.error?.code === "SECURITY_POLICY_BLOCKED", "API 3: Returns 403 on private IP target");

    // Test: Localhost Blocked
    const reqLocal = new Request("https://tooltive.com/api/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://localhost/robots.txt" })
    });
    const resLocal = await POST(reqLocal);
    assert(resLocal.status === 403, "API 4: Returns 403 on localhost target");

    // Test: Oversized request body
    const bigString = "a".repeat(3000);
    const reqBig = new Request("https://tooltive.com/api/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://example.com/${bigString}` })
    });
    const resBig = await POST(reqBig);
    assert(resBig.status === 400 || resBig.status === 413, "API 5: Rejects oversized request body (> 2 KB)");
  }

  // -------------------------------------------------------------
  // 5. LIVE FETCH TEST AGAINST PUBLIC ENDPOINT (ToolTive itself)
  // -------------------------------------------------------------
  {
    console.log("Testing live fetch against ToolTive's production robots.txt...");
    const reqLive = new Request("https://tooltive.com/api/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://tooltive.com" })
    });

    try {
      const resLive = await POST(reqLive);
      const jsonLive = await resLive.json();

      assert(resLive.status === 200, "Live Test 1: API returns HTTP 200");
      assert(jsonLive.ok === true, "Live Test 2: Response has ok: true");
      assert(jsonLive.status === "found", "Live Test 3: Status is 'found'");
      assert(jsonLive.sourceUrl === "https://tooltive.com/robots.txt", "Live Test 4: Source URL normalized to /robots.txt");
      assert(typeof jsonLive.body === "string" && /user-agent:\s*\*/i.test(jsonLive.body), "Live Test 5: Body contains valid robots.txt with 'User-Agent: *'");
      assert(jsonLive.bytes > 0, "Live Test 6: Returns positive byte count");

      console.log(`Live fetch details: status=${jsonLive.status}, bytes=${jsonLive.bytes}, redirects=${jsonLive.redirects?.length || 0}`);
    } catch (err: unknown) {
      console.warn("Live test network notice (offline or DNS):", err);
    }
  }

  console.log("=================================================");
  console.log(`STEP 4 TEST RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRobotsFetchTestSuite();
