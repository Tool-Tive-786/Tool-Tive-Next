import * as cheerio from 'cheerio';

const urlsToTest = [
  'https://tooltive.com/',
  'https://tooltive.com/all-tools/seo/ai-search-optimizer',
  'https://tooltive.com/all-tools/seo/free-robots-txt-generator',
  'https://tooltive.com/all-tools/seo/free-xml-sitemap-generator',
  'https://tooltive.com/blog/ai',
  'https://tooltive.com/blog/business',
  'http://tooltive.com/',
  'http://tooltive.com/all-tools/seo/ai-search-optimizer',
  'http://tooltive.com/all-tools/seo/free-robots-txt-generator',
  'http://tooltive.com/all-tools/seo/free-xml-sitemap-generator',
  'http://tooltive.com/blog/ai',
  'http://tooltive.com/blog/business'
];

async function audit() {
  console.log('=== LIVE PRODUCTION AUDIT ===\n');
  for (const url of urlsToTest) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status >= 300 && res.status < 400) {
        console.log(`URL: ${url}`);
        console.log(`  Status: ${res.status}`);
        console.log(`  Location: ${res.headers.get('location')}`);
        console.log('--------------------------------------------------');
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      
      const title = $('title').text().trim();
      const canonical = $('link[rel="canonical"]').attr('href');
      const robots = $('meta[name="robots"]').attr('content') || 'index, follow (default)';
      const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
      const internalLinksCount = $('a[href^="/"], a[href^="https://tooltive.com"]').length;
      const htmlLength = html.length;

      console.log(`URL: ${url}`);
      console.log(`  Status: ${res.status}`);
      console.log(`  Title: ${title}`);
      console.log(`  Canonical: ${canonical}`);
      console.log(`  Robots: ${robots}`);
      console.log(`  H1: ${h1}`);
      console.log(`  Internal Links: ${internalLinksCount}`);
      console.log(`  HTML Size: ${htmlLength} bytes`);
      console.log('--------------------------------------------------');
    } catch (err) {
      console.error(`Error auditing ${url}:`, err.message);
    }
  }
}

audit();
