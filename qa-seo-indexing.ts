import fs from 'fs';
import path from 'path';
import nextConfig from './next.config';
import robots from './src/app/robots';

async function runRegressionSuite() {
  console.log('====================================================');
  console.log('   TOOLTIVE PRODUCTION SEO & INDEXING REGRESSION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean, extra = '') {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc} ${extra}`);
      failed++;
    }
  }

  // 1. Robots.txt configuration test
  console.log('--- TEST 1: robots.ts Directives ---');
  const robotsConfig = robots();
  const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
  assert('Robots allows root crawl', rules?.allow === '/');
  assert(
    'Robots disallows /api/ and /cdn-cgi/',
    Array.isArray(rules?.disallow) &&
      rules?.disallow.includes('/api/') &&
      rules?.disallow.includes('/cdn-cgi/')
  );
  assert('Robots points to canonical sitemap', robotsConfig.sitemap === 'https://tooltive.com/sitemap.xml');
  assert('Robots points to canonical host', robotsConfig.host === 'https://tooltive.com');

  // 2. Favicon file verification
  console.log('\n--- TEST 2: Favicon Resource Verification ---');
  const publicFaviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
  const appFaviconPath = path.join(process.cwd(), 'src', 'app', 'favicon.ico');
  assert('public/favicon.ico exists', fs.existsSync(publicFaviconPath));
  assert('src/app/favicon.ico exists', fs.existsSync(appFaviconPath));
  if (fs.existsSync(publicFaviconPath)) {
    const icoBuf = fs.readFileSync(publicFaviconPath);
    const isIco = icoBuf.readUInt16LE(0) === 0 && icoBuf.readUInt16LE(2) === 1;
    assert('public/favicon.ico has valid ICO format header', isIco);
    assert('public/favicon.ico is non-empty (>1KB)', icoBuf.length > 1024);
  }

  // 3. Next.js headers test
  console.log('\n--- TEST 3: next.config.ts Headers & Asset Noindex ---');
  if (typeof nextConfig.headers === 'function') {
    const headersList = await nextConfig.headers();
    const mediaHeader = headersList.find(
      (h: any) => h.source === '/_next/static/media/:path*'
    );
    assert('next.config.ts has header for /_next/static/media/:path*', !!mediaHeader);
    const hasNoIndex = mediaHeader?.headers.some(
      (h: any) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')
    );
    assert('Static media header specifies X-Robots-Tag: noindex', !!hasNoIndex);

    const globalSecurity = headersList.find((h: any) => h.source === '/(.*)');
    assert('Global security headers exist', !!globalSecurity);
    const hasHsts = globalSecurity?.headers.some((h: any) => h.key === 'Strict-Transport-Security');
    assert('HSTS header is configured', !!hasHsts);
  } else {
    assert('nextConfig.headers is a function', false);
  }

  // 4. Live Redirect Verification (HTTP -> HTTPS single-hop direct 301)
  console.log('\n--- TEST 4: Live HTTP -> HTTPS Direct 301 Normalization ---');
  const redirectUrls = [
    'http://tooltive.com/',
    'http://tooltive.com/all-tools/seo/ai-search-optimizer',
    'http://tooltive.com/all-tools/seo/free-robots-txt-generator',
    'http://tooltive.com/blog/ai'
  ];

  for (const url of redirectUrls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      assert(
        `${url} returns 301 redirect`,
        res.status === 301,
        `got ${res.status}`
      );
      const loc = res.headers.get('location');
      const expectedHttps = url.replace('http://', 'https://');
      assert(
        `${url} redirects directly to ${expectedHttps}`,
        loc === expectedHttps,
        `got ${loc}`
      );
    } catch (e: any) {
      assert(`${url} fetch succeeds`, false, e.message);
    }
  }

  // 5. Live Trailing Slash Normalization (308 -> non-slash canonical)
  console.log('\n--- TEST 5: Trailing Slash Normalization ---');
  const trailingSlashUrls = [
    'https://tooltive.com/all-tools/seo/ai-search-optimizer/',
    'https://tooltive.com/blog/ai/'
  ];
  for (const url of trailingSlashUrls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      assert(
        `${url} returns 308 normalization`,
        res.status === 308,
        `got ${res.status}`
      );
      const loc = res.headers.get('location');
      const expectedClean = url.replace('https://tooltive.com', '').replace(/\/$/, '');
      assert(
        `${url} location is ${expectedClean}`,
        loc === expectedClean,
        `got ${loc}`
      );
    } catch (e: any) {
      assert(`${url} fetch succeeds`, false, e.message);
    }
  }

  // 6. Live Non-existent URLs return 404 (No fake redirects to homepage)
  console.log('\n--- TEST 6: Real 404 Behavior on Bot / Scanned URLs ---');
  const notFoundUrls = [
    'https://tooltive.com/feed',
    'https://tooltive.com/comments/feed',
    'https://tooltive.com/wp-login.php',
    'https://tooltive.com/non-existent-page-xyz-123'
  ];
  for (const url of notFoundUrls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      assert(
        `${url} returns proper 404 status`,
        res.status === 404,
        `got ${res.status}`
      );
    } catch (e: any) {
      assert(`${url} fetch succeeds`, false, e.message);
    }
  }

  // 7. Live Canonical HTML 200 & Substantial Content
  console.log('\n--- TEST 7: Important Pages 200 OK & Substantial HTML ---');
  const canonicalPages = [
    'https://tooltive.com/',
    'https://tooltive.com/all-tools',
    'https://tooltive.com/all-tools/seo',
    'https://tooltive.com/all-tools/seo/ai-search-optimizer',
    'https://tooltive.com/all-tools/seo/free-robots-txt-generator',
    'https://tooltive.com/all-tools/seo/free-xml-sitemap-generator',
    'https://tooltive.com/blog',
    'https://tooltive.com/blog/ai',
    'https://tooltive.com/blog/business'
  ];
  for (const url of canonicalPages) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      assert(
        `${url} returns 200 OK`,
        res.status === 200,
        `got ${res.status}`
      );
      const text = await res.text();
      assert(
        `${url} contains substantial HTML (>10,000 bytes)`,
        text.length > 10000,
        `size: ${text.length}`
      );
      assert(
        `${url} contains <title>`,
        text.includes('<title>'),
        'missing title'
      );
      assert(
        `${url} contains canonical link`,
        text.includes('rel="canonical"'),
        'missing canonical'
      );
    } catch (e: any) {
      assert(`${url} fetch succeeds`, false, e.message);
    }
  }

  // Summary
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal error running regression suite:', err);
  process.exit(1);
});
