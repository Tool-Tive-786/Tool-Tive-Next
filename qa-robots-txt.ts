import {
  parseRobotsTxt,
  matchRobotsUrl,
  validateRobotsTxt,
  generateRobotsTxt,
  getCrawlerPresets,
  validateRobotsFetchUrl
} from "./src/lib/robots-txt";

async function runRobotsTxtTestSuite() {
  console.log("=================================================");
  console.log("TOOLTIVE — ROBOTS.TXT ENGINE QA TEST SUITE");
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

  // --- TEST 1: No rules (User-agent: *) -> /anything -> ALLOWED ---
  {
    const parsed = parseRobotsTxt("User-agent: *");
    const res = matchRobotsUrl(parsed, "/anything", "*");
    assert(res.decision === "allowed", "Test 1: No rules allows access to /anything");
  }

  // --- TEST 2: Wildcard disallow ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nDisallow: /private/");
    const blocked = matchRobotsUrl(parsed, "/private/page", "*");
    const allowed = matchRobotsUrl(parsed, "/public/page", "*");
    assert(blocked.decision === "blocked", "Test 2a: Wildcard disallows /private/page");
    assert(allowed.decision === "allowed", "Test 2b: Wildcard allows /public/page");
  }

  // --- TEST 3: Specific Allow beats broader Disallow ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nDisallow: /private/\nAllow: /private/public/");
    const res = matchRobotsUrl(parsed, "/private/public/page", "*");
    assert(res.decision === "allowed", "Test 3: More specific Allow beats broader Disallow");
  }

  // --- TEST 4: More specific Disallow beats broader Allow ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nAllow: /example/page/\nDisallow: /example/page/private");
    const res = matchRobotsUrl(parsed, "/example/page/private", "*");
    assert(res.decision === "blocked", "Test 4: More specific Disallow beats broader Allow");
  }

  // --- TEST 5: Equal-specificity conflict (Google-compatible least restrictive wins) ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nAllow: /folder\nDisallow: /folder");
    const res = matchRobotsUrl(parsed, "/folder", "*");
    assert(res.decision === "allowed", "Test 5: Equal-specificity conflict results in Allow");
    assert(res.reason === "equal_specificity_allow", "Test 5: Reason is equal_specificity_allow");
  }

  // --- TEST 6: Specific group beats wildcard group ---
  {
    const txt = `
User-agent: *
Disallow: /private/

User-agent: Googlebot
Allow: /private/
`;
    const parsed = parseRobotsTxt(txt);
    const googleRes = matchRobotsUrl(parsed, "/private/data", "Googlebot");
    const bingRes = matchRobotsUrl(parsed, "/private/data", "Bingbot");
    assert(googleRes.decision === "allowed", "Test 6a: Specific Googlebot group allows /private/data");
    assert(bingRes.decision === "blocked", "Test 6b: Fallback to * group blocks Bingbot from /private/data");
  }

  // --- TEST 7: Multiple groups matching same crawler ---
  {
    const txt = `
User-agent: ExampleBot
Disallow: /foo

User-agent: ExampleBot
Disallow: /bar
`;
    const parsed = parseRobotsTxt(txt);
    const fooRes = matchRobotsUrl(parsed, "/foo", "ExampleBot");
    const barRes = matchRobotsUrl(parsed, "/bar", "ExampleBot");
    const pubRes = matchRobotsUrl(parsed, "/public", "ExampleBot");
    assert(fooRes.decision === "blocked", "Test 7a: First matching group blocks /foo");
    assert(barRes.decision === "blocked", "Test 7b: Second matching group blocks /bar");
    assert(pubRes.decision === "allowed", "Test 7c: Unblocked /public is allowed");
  }

  // --- TEST 8: Multiple User-agent lines in one group ---
  {
    const txt = `
User-agent: foo
User-agent: bar
Disallow: /private/
`;
    const parsed = parseRobotsTxt(txt);
    const fooRes = matchRobotsUrl(parsed, "/private/doc", "foo");
    const barRes = matchRobotsUrl(parsed, "/private/doc", "bar");
    assert(fooRes.decision === "blocked", "Test 8a: Crawler 'foo' is blocked");
    assert(barRes.decision === "blocked", "Test 8b: Crawler 'bar' is blocked");
  }

  // --- TEST 9: Case-insensitive user-agent matching ---
  {
    const parsed = parseRobotsTxt("User-agent: ExampleBot\nDisallow: /test");
    const res = matchRobotsUrl(parsed, "/test", "examplebot");
    assert(res.decision === "blocked", "Test 9: Case-insensitive user-agent matching works");
  }

  // --- TEST 10: Path case sensitivity ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nDisallow: /Private/");
    const resUpper = matchRobotsUrl(parsed, "/Private/x", "*");
    const resLower = matchRobotsUrl(parsed, "/private/x", "*");
    assert(resUpper.decision === "blocked", "Test 10a: /Private/x is blocked");
    assert(resLower.decision === "allowed", "Test 10b: /private/x is allowed (case sensitivity preserved)");
  }

  // --- TEST 11: Root disallow ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nDisallow: /");
    const res = matchRobotsUrl(parsed, "/anything", "*");
    assert(res.decision === "blocked", "Test 11: Root Disallow: / blocks /anything");
  }

  // --- TEST 12: /robots.txt implicit allow (RFC 9309 Section 2.1) ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nDisallow: /");
    const res = matchRobotsUrl(parsed, "/robots.txt", "*");
    assert(res.decision === "allowed", "Test 12a: /robots.txt is implicitly allowed despite Disallow: /");
    assert(res.reason === "robots_txt_implicit_allow", "Test 12b: Reason is robots_txt_implicit_allow");
  }

  // --- TEST 13: Rules before User-agent are ignored ---
  {
    const txt = `
Disallow: /ignored/
User-agent: *
Disallow: /active/
`;
    const parsed = parseRobotsTxt(txt);
    assert(parsed.warnings.some(w => w.code === "RULE_BEFORE_USER_AGENT"), "Test 13a: Emits RULE_BEFORE_USER_AGENT warning");
    const resIgnored = matchRobotsUrl(parsed, "/ignored/page", "*");
    const resActive = matchRobotsUrl(parsed, "/active/page", "*");
    assert(resIgnored.decision === "allowed", "Test 13b: Rule before User-agent is ignored for matching");
    assert(resActive.decision === "blocked", "Test 13c: Active rule in group is enforced");
  }

  // --- TEST 14: Empty Disallow allows everything ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nDisallow:");
    const res = matchRobotsUrl(parsed, "/any-page", "*");
    assert(res.decision === "allowed", "Test 14: Empty Disallow: does not block pages");
  }

  // --- TEST 15 & 16: Sitemap directive parsing ---
  {
    const txt = `
User-agent: *
Disallow: /private/
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-images.xml
`;
    const parsed = parseRobotsTxt(txt);
    assert(parsed.sitemaps.length === 2, "Test 15 & 16: Parses multiple global sitemaps separately");
    assert(parsed.sitemaps[0].url === "https://example.com/sitemap.xml", "Test 15 & 16: Sitemap 1 URL matches");
  }

  // --- TEST 17: Invalid sitemap URL ---
  {
    const parsed = parseRobotsTxt("User-agent: *\nSitemap: /relative-sitemap.xml");
    assert(parsed.warnings.some(w => w.code === "INVALID_SITEMAP_URL"), "Test 17: Flags relative sitemap URL as invalid");
  }

  // --- TEST 18: Duplicate rules produce warning in validator ---
  {
    const txt = `
User-agent: *
Disallow: /dup/
Disallow: /dup/
`;
    const parsed = parseRobotsTxt(txt);
    const validation = validateRobotsTxt(parsed);
    assert(validation.warnings.some(w => w.code === "DUPLICATE_RULE"), "Test 18: Validator detects duplicate rules");
  }

  // --- TEST 19: Unknown directive does not crash parser ---
  {
    const txt = `
User-agent: *
Host: example.com
Disallow: /admin/
`;
    const parsed = parseRobotsTxt(txt);
    assert(parsed.unknownDirectives.length === 1, "Test 19a: Preserves unknown directive");
    assert(parsed.unknownDirectives[0].name === "host", "Test 19b: Correct unknown directive name");
  }

  // --- TEST 20: Malformed line does not crash parser ---
  {
    const txt = `
User-agent: *
this is a malformed line with no colon
Disallow: /secret
`;
    const parsed = parseRobotsTxt(txt);
    assert(parsed.warnings.some(w => w.code === "MALFORMED_LINE"), "Test 20: Malformed line produces warning without crash");
  }

  // --- WILDCARD TEST MATRIX (Google-documented examples) ---
  {
    // Test: Allow: /p vs Disallow: / for /page -> ALLOW
    const txt1 = "User-agent: *\nDisallow: /\nAllow: /p";
    const p1 = parseRobotsTxt(txt1);
    assert(matchRobotsUrl(p1, "/page", "*").decision === "allowed", "Wildcard 1: /p (length 2) beats / (length 1) for /page");

    // Test: Allow: /page vs Disallow: /*.htm for /page.htm -> DISALLOW
    const txt2 = "User-agent: *\nAllow: /page\nDisallow: /*.htm";
    const p2 = parseRobotsTxt(txt2);
    assert(matchRobotsUrl(p2, "/page.htm", "*").decision === "blocked", "Wildcard 2: /*.htm (length 6) beats /page (length 5) for /page.htm");

    // Test: Allow: /page vs Disallow: /*.ph for /page.php5 -> ALLOW (equal specificity tie-breaker)
    const txt3 = "User-agent: *\nAllow: /page\nDisallow: /*.ph";
    const p3 = parseRobotsTxt(txt3);
    assert(matchRobotsUrl(p3, "/page.php5", "*").decision === "allowed", "Wildcard 3: Equal length 5 Allow wins over Disallow for /page.php5");

    // Test: Allow: /$ vs Disallow: / for / -> ALLOW, for /page -> DISALLOW
    const txt4 = "User-agent: *\nDisallow: /\nAllow: /$";
    const p4 = parseRobotsTxt(txt4);
    assert(matchRobotsUrl(p4, "/", "*").decision === "allowed", "Wildcard 4a: /$ matches root /");
    assert(matchRobotsUrl(p4, "/page", "*").decision === "blocked", "Wildcard 4b: /$ does not match /page, blocked by Disallow: /");
  }

  // --- ENCODING TESTS ---
  {
    const txt = "User-agent: *\nDisallow: /example/bar/baz";
    const parsed = parseRobotsTxt(txt);
    // %62 = b, %61 = a, %7A = z -> baz
    const encodedUrl = "https://example.com/example/bar/%62%61%7A";
    const res = matchRobotsUrl(parsed, encodedUrl, "*");
    assert(res.decision === "blocked", "Encoding Test 1: Decodes unreserved characters (%62%61%7A -> baz) to match");

    // Reserved characters like %2F must NOT be decoded to '/'
    const txtSlash = "User-agent: *\nDisallow: /a/b/";
    const pSlash = parseRobotsTxt(txtSlash);
    const reservedUrl = "/a%2Fb/";
    const resSlash = matchRobotsUrl(pSlash, reservedUrl, "*");
    assert(resSlash.decision === "allowed", "Encoding Test 2: Reserved %2F remains encoded and does not match literal /");
  }

  // --- GENERATOR TESTS ---
  {
    const input = {
      headerComment: "ToolTive Robots.txt Generator",
      groups: [
        {
          userAgents: ["*"],
          rules: [
            { action: "allow" as const, path: "/" },
            { action: "disallow" as const, path: "/admin/" }
          ]
        },
        {
          userAgents: ["Googlebot", "Bingbot"],
          rules: [
            { action: "allow" as const, path: "/api/public/" },
            { action: "disallow" as const, path: "/api/" }
          ]
        }
      ],
      sitemaps: ["https://example.com/sitemap.xml"]
    };

    const out1 = generateRobotsTxt(input);
    const out2 = generateRobotsTxt(input);

    assert(out1 === out2, "Generator 1: Output is strictly deterministic across runs");
    assert(out1.endsWith("\n") && !out1.endsWith("\n\n"), "Generator 2: Output ends with exactly one newline");
    assert(out1.includes("User-agent: *\nAllow: /\nDisallow: /admin/"), "Generator 3: Group 1 formatted correctly");
    assert(out1.includes("User-agent: Googlebot\nUser-agent: Bingbot"), "Generator 4: Multiple user-agents in group formatted correctly");
    assert(out1.includes("Sitemap: https://example.com/sitemap.xml"), "Generator 5: Sitemaps formatted correctly");
  }

  // --- VALIDATOR TESTS ---
  {
    const txt = `
User-agent: *
Disallow: /

User-agent: *
Disallow: /admin/
`;
    const parsed = parseRobotsTxt(txt);
    const val = validateRobotsTxt(parsed);

    assert(val.warnings.some(w => w.code === "DISALLOW_ROOT"), "Validator 1: Detects broad Disallow: / blocking warning");
    assert(val.diagnostics.some(d => d.code === "MULTIPLE_MATCHING_GROUPS"), "Validator 2: Detects multiple matching groups for *");
    assert(val.stats.hasRootDisallow === true, "Validator 3: Stats hasRootDisallow is true");
    assert(val.isValid === true, "Validator 4: Warnings do not mark file as invalid (errors = 0)");
  }

  // --- SECURITY TESTS ---
  {
    assert(validateRobotsFetchUrl("https://example.com/robots.txt").safe === true, "Security 1: Accepts https://example.com/robots.txt");
    assert(validateRobotsFetchUrl("http://example.com/robots.txt").safe === true, "Security 2: Accepts http://example.com/robots.txt");
    assert(validateRobotsFetchUrl("http://localhost/robots.txt").safe === false, "Security 3: Rejects localhost");
    assert(validateRobotsFetchUrl("http://127.0.0.1/robots.txt").safe === false, "Security 4: Rejects 127.0.0.1 loopback");
    assert(validateRobotsFetchUrl("http://10.0.0.1/robots.txt").safe === false, "Security 5: Rejects 10.0.0.0/8 private IP");
    assert(validateRobotsFetchUrl("http://192.168.1.1/robots.txt").safe === false, "Security 6: Rejects 192.168.0.0/16 private IP");
    assert(validateRobotsFetchUrl("http://172.16.0.1/robots.txt").safe === false, "Security 7: Rejects 172.16.0.0/12 private IP");
    assert(validateRobotsFetchUrl("http://169.254.169.254/").safe === false, "Security 8: Rejects 169.254.169.254 cloud metadata IP");
    assert(validateRobotsFetchUrl("file:///etc/passwd").safe === false, "Security 9: Rejects file:// scheme");
    assert(validateRobotsFetchUrl("javascript:alert(1)").safe === false, "Security 10: Rejects javascript: scheme");
    assert(validateRobotsFetchUrl("data:text/plain,hello").safe === false, "Security 11: Rejects data: scheme");
    assert(validateRobotsFetchUrl("https://user:pass@example.com/").safe === false, "Security 12: Rejects credentials in URL");
  }

  // --- PRESETS TEST ---
  {
    const presets = getCrawlerPresets();
    assert(presets.length >= 10, "Presets: Returns comprehensive crawler presets");
    assert(presets.some(p => p.productToken === "Googlebot"), "Presets: Contains Googlebot");
    assert(presets.some(p => p.productToken === "GPTBot"), "Presets: Contains GPTBot");
  }

  console.log("=================================================");
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRobotsTxtTestSuite();
