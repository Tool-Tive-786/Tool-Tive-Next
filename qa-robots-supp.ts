import { parseRobotsTxt, matchRobotsUrl, validateRobotsTxt, generateRobotsTxt } from "./src/lib/robots-txt";

let passed = 0, failed = 0;
function assert(cond: boolean, name: string, detail?: string) {
  if (cond) { console.log(`PASS: ${name}`); passed++; }
  else { console.error(`FAIL: ${name}${detail ? " -> " + detail : ""}`); failed++; }
}

// S1: full URL input identical to path input
{
  const parsed = parseRobotsTxt("User-agent: *\nDisallow: /private/");
  const a = matchRobotsUrl(parsed, "https://example.com/private/page", "*");
  const b = matchRobotsUrl(parsed, "/private/page", "*");
  assert(a.decision === "blocked" && b.decision === "blocked", "S1: full-URL and path inputs behave identically");
  assert(a.normalizedPath === "/private/page", "S1b: normalizedPath extracts path+query only");
}

// S2: Unicode path does not crash and matches case-sensitively
{
  const parsed = parseRobotsTxt("User-agent: *\nDisallow: /übung/");
  assert(matchRobotsUrl(parsed, "/übung/page", "*").decision === "blocked", "S2: Unicode path matched");
  assert(matchRobotsUrl(parsed, "/something", "*").decision === "allowed", "S2b: unrelated Unicode-safe path allowed");
}

// S3: empty file => controlled validation, no crash
{
  const parsed = parseRobotsTxt("");
  const val = validateRobotsTxt(parsed);
  assert(val.isValid === true, "S3: empty file -> valid with warnings, no crash");
  assert(val.warnings.some((w) => w.code === "EMPTY_FILE"), "S3b: EMPTY_FILE warning present");
  assert(matchRobotsUrl(parsed, "/anything", "*").decision === "allowed", "S3c: empty file allows everything");
}

// S4: generator keeps groups separate (no merge) and multi-UA single group intact
{
  const generated = generateRobotsTxt({
    groups: [
      { userAgents: ["Googlebot"], rules: [{ action: "disallow", path: "/private/" }] },
      { userAgents: ["Bingbot"], rules: [{ action: "disallow", path: "/tmp/" }] },
      { userAgents: ["foo", "bar"], rules: [{ action: "disallow", path: "/private/" }] }
    ],
    sitemaps: []
  });
  const parsed = parseRobotsTxt(generated);
  assert(parsed.groups.length === 3, "S4: 3 distinct groups in output, no merging");
  assert(parsed.groups[2].userAgents.join(",") === "foo,bar", "S4b: foo+bar remain in one group");
  const out = generated.split("\n\n");
  assert(out[0].includes("User-agent: Googlebot") && !out[0].includes("Bingbot"), "S4c: group 1 isolated");
}

// S5: tester spec scenario (Googlebot + wildcard, Allow more specific than Disallow)
{
  const parsed = parseRobotsTxt("User-agent: *\nDisallow: /private/\nAllow: /private/public/");
  assert(matchRobotsUrl(parsed, "/private/", "Googlebot").decision === "blocked", "S5a: /private/ BLOCKED");
  assert(matchRobotsUrl(parsed, "/private/public/page", "Googlebot").decision === "allowed", "S5b: /private/public/page ALLOWED");
  assert(matchRobotsUrl(parsed, "/public/page", "Googlebot").decision === "allowed", "S5c: /public/page ALLOWED");
}

// S6: Windows CRLF and CR-only line endings parse
{
  const parsed = parseRobotsTxt("User-agent: *\r\nDisallow: /private/\r\n");
  assert(parsed.groups.length === 1 && parsed.groups[0].rules.length === 1, "S6: CRLF parsed cleanly");
}

// S7: rawContent of generator round-trips through parser without directive loss
{
  const generated = generateRobotsTxt({
    groups: [{ userAgents: ["*"], rules: [
      { action: "allow", path: "/" },
      { action: "disallow", path: "/admin/" },
      { action: "disallow", path: "/private/" }
    ]}],
    sitemaps: ["https://example.com/sitemap.xml"]
  });
  const parsed = parseRobotsTxt(generated);
  const g = parsed.groups[0];
  assert(g.rules.length === 3, "S7: all 3 rules preserved through round-trip");
  assert(parsed.sitemaps.length === 1 && parsed.sitemaps[0].url === "https://example.com/sitemap.xml", "S7b: sitemap preserved");
  assert(g.rules.some((r) => r.action === "allow" && r.path === "/"), "S7c: leading allow preserved");
}

console.log(`\nSUPPLEMENTARY: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);