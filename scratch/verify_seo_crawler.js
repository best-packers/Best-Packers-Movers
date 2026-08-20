const http = require('http');
const app = require('../api/index');
const { initDb } = require('../config/db');

async function testCrawlerSEO() {
  console.log('====================================================');
  console.log('  STARTING GOOGLEBOT & CRAWLER SEO READABILITY AUDIT');
  console.log('====================================================\n');

  await initDb();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Test server running on ${baseUrl}\n`);

  async function fetchUrl(path, userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)') {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    const status = res.status;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    return { status, contentType, text };
  }

  const results = [];
  let passedAll = true;

  // Helper checks
  function auditHtml(path, html, checks = {}) {
    const issues = [];
    
    // Check title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    if (!title) issues.push('Missing or empty <title>');

    // Check meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const desc = descMatch ? descMatch[1].trim() : null;
    if (!desc) issues.push('Missing or empty <meta name="description">');

    // Check robots meta
    const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
    const robots = robotsMatch ? robotsMatch[1].trim() : null;
    if (!robots || !robots.includes('index')) issues.push('Robots meta missing index directive');

    // Check canonical
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;
    if (!canonical) issues.push('Missing <link rel="canonical">');

    // Check H1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : null;
    if (!h1) issues.push('Missing <h1> tag');

    // Check JSON-LD schemas
    const schemaMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
    const schemas = [];
    schemaMatches.forEach((m, idx) => {
      try {
        const parsed = JSON.parse(m[1]);
        schemas.push(parsed['@type'] || 'ValidJSON');
      } catch (e) {
        issues.push(`Invalid JSON-LD schema block #${idx + 1}: ${e.message}`);
      }
    });

    if (checks.requireSchema && schemas.length === 0) {
      issues.push('Page requires structured JSON-LD schema but none was found');
    }

    return {
      path,
      title,
      h1,
      descLength: desc ? desc.length : 0,
      canonical,
      schemas,
      issues
    };
  }

  // 1. Audit robots.txt
  console.log('--- Checking /robots.txt ---');
  const robotsRes = await fetchUrl('/robots.txt');
  console.log(`Status: ${robotsRes.status}, Content-Type: ${robotsRes.contentType}`);
  if (robotsRes.status === 200 && robotsRes.text.includes('Allow: /') && robotsRes.text.includes('Sitemap:')) {
    console.log('✅ /robots.txt is fully accessible and configured for crawlers.\n');
  } else {
    console.error('❌ /robots.txt failed validation!\n');
    passedAll = false;
  }

  // 2. Audit sitemap.xml
  console.log('--- Checking /sitemap.xml ---');
  const sitemapRes = await fetchUrl('/sitemap.xml');
  console.log(`Status: ${sitemapRes.status}, Content-Type: ${sitemapRes.contentType}`);
  const urlCount = (sitemapRes.text.match(/<loc>/g) || []).length;
  console.log(`Total URLs indexed in dynamic sitemap: ${urlCount}`);
  if (sitemapRes.status === 200 && sitemapRes.text.includes('<?xml') && sitemapRes.text.includes('<urlset') && urlCount > 10) {
    console.log('✅ /sitemap.xml is valid XML with comprehensive URL discovery.\n');
  } else {
    console.error('❌ /sitemap.xml failed validation!\n');
    passedAll = false;
  }

  // 3. Test Core Public Pages
  const pagesToTest = [
    { path: '/', name: 'Homepage', requireSchema: false },
    { path: '/state/uttar-pradesh', name: 'State Hub (Uttar Pradesh)', requireSchema: true },
    { path: '/lucknow', name: 'City Directory (Lucknow)', requireSchema: true },
    { path: '/lucknow/shifting-services', name: 'Keyword Variant (Shifting Services in Lucknow)', requireSchema: true },
    { path: '/lucknow/top-packers-and-movers', name: 'Keyword Variant (Top Movers Lucknow)', requireSchema: true },
    { path: '/lucknow/house-shifting', name: 'Keyword Variant (House Shifting Lucknow)', requireSchema: true },
    { path: '/lucknow/cheap-packers-and-movers', name: 'Keyword Variant (Cheap Movers Lucknow)', requireSchema: true },
    { path: '/lucknow/local-packers-and-movers', name: 'Keyword Variant (Local Movers Lucknow)', requireSchema: true },
    { path: '/lucknow/national-packers-movers', name: 'National Packers Vendor Page in Lucknow', requireSchema: true },
    { path: '/blog', name: 'Blog Index', requireSchema: false }
  ];

  for (const p of pagesToTest) {
    console.log(`--- Auditing ${p.name} (${p.path}) ---`);
    const res = await fetchUrl(p.path);
    if (res.status !== 200) {
      console.error(`❌ HTTP Status ${res.status} on ${p.path}`);
      passedAll = false;
      continue;
    }
    const audit = auditHtml(p.path, res.text, { requireSchema: p.requireSchema });
    if (audit.issues.length === 0) {
      console.log(`  ✓ Title: "${audit.title}"`);
      console.log(`  ✓ H1: "${audit.h1}"`);
      console.log(`  ✓ Description: ${audit.descLength} chars`);
      console.log(`  ✓ Canonical: ${audit.canonical}`);
      console.log(`  ✓ Schemas: [${audit.schemas.join(', ')}]`);
      console.log(`✅ ${p.name} PASSED Googlebot & SEO Crawlability checks!\n`);
    } else {
      console.error(`❌ Issues found on ${p.path}:`);
      audit.issues.forEach(i => console.error(`  - ${i}`));
      console.log();
      passedAll = false;
    }
  }

  // 4. Test a Competitor Vendor Profile
  console.log('--- Auditing Competitor Vendor Profile ---');
  // Find a vendor in database
  const { db } = require('../config/db');
  const sampleVendor = await db('vendors').where({ is_national: false }).first();
  if (sampleVendor) {
    const city = await db('cities').where({ id: sampleVendor.city_id }).first();
    if (city) {
      const vendorUrl = `/${city.slug}/${sampleVendor.slug}`;
      console.log(`Testing competitor URL: ${vendorUrl}`);
      const res = await fetchUrl(vendorUrl);
      if (res.status === 200) {
        const audit = auditHtml(vendorUrl, res.text, { requireSchema: true });
        if (audit.issues.length === 0) {
          console.log(`  ✓ Title: "${audit.title}"`);
          console.log(`  ✓ H1: "${audit.h1}"`);
          console.log(`  ✓ Schemas: [${audit.schemas.join(', ')}]`);
          console.log(`✅ Competitor Vendor Page PASSED Googlebot & SEO Crawlability checks!\n`);
        } else {
          console.error(`❌ Issues on competitor vendor page:`, audit.issues);
          passedAll = false;
        }
      } else {
        console.error(`❌ Competitor profile HTTP ${res.status}`);
        passedAll = false;
      }
    }
  }

  server.close();

  if (passedAll) {
    console.log('====================================================');
    console.log('✨ 100% CRAWLER & GOOGLEBOT AUDIT PASSED WITH ZERO ERRORS! ✨');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('Audit encountered issues.');
    process.exit(1);
  }
}

testCrawlerSEO().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
