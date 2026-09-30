import { processBasicScan } from "./src/lib/ai-search/crawler";

interface SiteTestResult {
  url: string;
  category: string;
  completed: boolean;
  pagesDiscovered: number;
  pagesScanned: number;
  error?: string;
  score: number;
  majorFindings: string[];
  expectedBehavior: string;
  actualBehavior: string;
  durationMs: number;
}

const targetSites: Array<{ url: string; category: string; expected: string }> = [
  { 
    url: "https://example.com", 
    category: "Simple static site", 
    expected: "Fast scan of 1 page; flags missing robots.txt, missing sitemap, missing canonical." 
  },
  { 
    url: "http://neverssl.com", 
    category: "HTTP-only / Non-HTTPS site", 
    expected: "Identifies missing HTTPS and insecurity flags cleanly." 
  },
  { 
    url: "https://wordpress.org", 
    category: "WordPress site", 
    expected: "Discovers sitemaps, crawls pages up to 10 limit, parses Schema.org." 
  },
  { 
    url: "https://nextjs.org", 
    category: "Next.js SSR / Modern documentation", 
    expected: "Extracts SSR headings and titles, bounds crawl depth at 2." 
  },
  { 
    url: "https://stripe.com", 
    category: "Strong security-header corporate site", 
    expected: "Detects strict HSTS, CSP, and security posture with high security category score." 
  },
  { 
    url: "https://developer.mozilla.org", 
    category: "Documentation site", 
    expected: "Audits dense internal links, semantic headings, and accessibility." 
  },
  { 
    url: "https://github.com", 
    category: "Enterprise platform", 
    expected: "Handles robots.txt restrictions and security headers safely." 
  },
  { 
    url: "https://en.wikipedia.org/wiki/Main_Page", 
    category: "Content & link-heavy encyclopedia", 
    expected: "Deduplicates internal links, stops at 10 pages maximum, checks headings." 
  },
  { 
    url: "https://bbc.com", 
    category: "High-traffic news / redirects", 
    expected: "Follows initial domain redirects within 3-hop limit, crawls articles." 
  },
  { 
    url: "https://cloudflare.com", 
    category: "Edge infrastructure / Strict TLS", 
    expected: "Identifies modern edge security headers and HTTPS." 
  },
  { 
    url: "https://httpbin.org", 
    category: "API / Test utility", 
    expected: "Handles lightweight HTML with minimal content and few internal links." 
  },
  { 
    url: "https://news.ycombinator.com", 
    category: "Minimal table-based HTML", 
    expected: "Flags missing schema and headings on retro HTML layout." 
  },
  { 
    url: "https://schema.org", 
    category: "Structured-data-heavy site", 
    expected: "Extracts multiple Schema.org JSON-LD definitions." 
  },
  { 
    url: "https://w3.org", 
    category: "Standards organization / Semantic HTML", 
    expected: "Identifies valid headings, semantic structure, and sitemaps." 
  },
  { 
    url: "https://python.org", 
    category: "Open source foundation / Documentation", 
    expected: "Audits sitemap URLs, navigation links, and community schema." 
  },
  { 
    url: "https://ietf.org", 
    category: "Standards / Text-heavy site", 
    expected: "Evaluates high-density visible text length." 
  },
  { 
    url: "https://apache.org", 
    category: "Foundation portal / Software banners", 
    expected: "Checks server response headers and project links." 
  },
  { 
    url: "https://gnu.org", 
    category: "Static traditional HTML", 
    expected: "Processes classic static pages without JavaScript requirements." 
  },
  { 
    url: "https://archive.org", 
    category: "Digital archive / Robots-restricted", 
    expected: "Respects robots.txt rules, limits crawl depth to 2." 
  },
  { 
    url: "https://tooltive.com", 
    category: "ToolTive platform (Self-audit)", 
    expected: "Audits own robots.txt, sitemaps, structured data, and security headers." 
  }
];

async function runRealWorldTests() {
  console.log("===================================================================");
  console.log("TOOLTIVE — 20 REAL-WORLD WEBSITES LIVE COMPATIBILITY QA RUNNER");
  console.log("===================================================================\n");

  const results: SiteTestResult[] = [];

  for (let i = 0; i < targetSites.length; i++) {
    const target = targetSites[i];
    console.log(`[${i + 1}/${targetSites.length}] Testing: ${target.url} (${target.category})...`);
    
    const startTime = Date.now();
    const scanId = `live_qa_${i + 1}`;
    
    try {
      const outcome = await processBasicScan(scanId, target.url);
      const durationMs = Date.now() - startTime;
      
      const findings: string[] = [];
      if (outcome.report) {
        // Collect top 3 issue codes
        outcome.report.issues.slice(0, 3).forEach(iss => {
          findings.push(`${iss.code} (${iss.severity})`);
        });
      }

      const resObj: SiteTestResult = {
        url: target.url,
        category: target.category,
        completed: outcome.error ? false : true,
        pagesDiscovered: outcome.pagesDiscovered,
        pagesScanned: outcome.pagesScanned,
        error: outcome.error,
        score: outcome.report ? outcome.report.score : 0,
        majorFindings: findings,
        expectedBehavior: target.expected,
        actualBehavior: outcome.error 
          ? `Error: ${outcome.error}` 
          : `Scanned ${outcome.pagesScanned} pages, Score: ${outcome.report?.score}/100 in ${(durationMs / 1000).toFixed(2)}s`,
        durationMs
      };

      results.push(resObj);
      console.log(`  -> Status: ${resObj.completed ? "COMPLETED" : "FAILED"}, Score: ${resObj.score}, Pages: ${resObj.pagesScanned}, Duration: ${(durationMs / 1000).toFixed(2)}s`);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      results.push({
        url: target.url,
        category: target.category,
        completed: false,
        pagesDiscovered: 0,
        pagesScanned: 0,
        error: err?.message || "Scan exception",
        score: 0,
        majorFindings: ["SCAN_EXCEPTION"],
        expectedBehavior: target.expected,
        actualBehavior: `Failed with exception: ${err?.message}`,
        durationMs
      });
      console.error(`  -> ERROR: ${err?.message}`);
    }
  }

  // Print Summary Table in JSON format so it can be embedded into the report
  console.log("\n===================================================================");
  console.log("REAL-WORLD SITE AUDIT RESULTS JSON OUTPUT:");
  console.log("===================================================================");
  console.log(JSON.stringify(results, null, 2));
}

runRealWorldTests();
