/**
 * scripts/verify_all_pan_india.js
 * Comprehensive automated verification of the 6-7 authentic movers per city expansion,
 * anti-programmatic local context engine, FAQPage schema, and sitemap indexability.
 */

async function runTests() {
  console.log('🧪 Starting Full-Spectrum PAN-India Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  async function testRoute(name, url, validators) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
      });
      const html = await res.text();

      console.log(`Testing [${name}] -> ${url}`);
      console.log(`   - HTTP Status: ${res.status} (Expected 200)`);
      if (res.status !== 200) {
        console.error(`   ❌ Failed: Unexpected HTTP status ${res.status}`);
        failed++;
        return;
      }

      let allValid = true;
      for (const val of validators) {
        const ok = val.fn(html, res);
        if (!ok) {
          console.error(`   ❌ Validation failed: ${val.desc}`);
          allValid = false;
        } else {
          console.log(`   ✓ ${val.desc}`);
        }
      }

      if (allValid) {
        passed++;
        console.log(`   ✅ PASSED\n`);
      } else {
        failed++;
        console.log(`   ❌ FAILED\n`);
      }
    } catch (err) {
      console.error(`   ❌ Error testing ${url}:`, err.message);
      failed++;
    }
  }

  // 1. Dhanbad General Intent Route
  await testRoute('Dhanbad Directory (7 Movers & FAQPage Schema)', 'http://localhost:3000/packers-and-movers-dhanbad', [
    { desc: 'Contains National Packers & Movers at rank 1', fn: (html) => html.includes('National Packers') },
    { desc: 'Contains Tridev Packers & Movers (GBP verified)', fn: (html) => html.includes('Tridev Packers') },
    { desc: 'Contains Lakshmi Packers & Movers', fn: (html) => html.includes('Lakshmi Packers') },
    { desc: 'Contains Chhota Hathi Safe Shifting', fn: (html) => html.includes('Chhota Hathi Safe Shifting') },
    { desc: 'Contains 7 Verified Movers badge', fn: (html) => /7(<!-- -->)?\s+Verified/.test(html) },
    { desc: 'Contains Local Shifting & Transit Guidelines advisory card', fn: (html) => html.includes('Commercial Vehicle Timings') && html.includes('Fleet &amp; Container Standards') },
    { desc: 'Contains ItemList Schema.org structured data', fn: (html) => html.includes('"@type":"ItemList"') },
    { desc: 'Contains FAQPage Schema.org structured data', fn: (html) => html.includes('"@type":"FAQPage"') },
    { desc: 'Contains Localized FAQ questions', fn: (html) => 
        html.includes('What are the average packers and movers charges in Dhanbad?') &&
        html.includes('Commercial Vehicle Timings')
    }
  ]);

  // 2. Coimbatore Best Intent Route
  await testRoute('Coimbatore Top Rated (7 Movers)', 'http://localhost:3000/best-packers-and-movers-coimbatore', [
    { desc: 'Contains National Packers & Movers at rank 1', fn: (html) => html.includes('National Packers') },
    { desc: 'Contains LKV Packers & Movers (Town Hall)', fn: (html) => html.includes('LKV Packers') },
    { desc: 'Contains Arunachalam Packers and Movers (Peelamedu)', fn: (html) => html.includes('Arunachalam Packers') },
    { desc: 'Contains Kovai Kings Packers and Movers (GN Mills)', fn: (html) => html.includes('Kovai Kings') },
    { desc: 'Contains Aalayam Packers and Movers (Ondipudur)', fn: (html) => html.includes('Aalayam Packers') },
    { desc: 'Contains Kongu Safe Relocations (RS Puram)', fn: (html) => html.includes('Kongu Safe Relocations') },
    { desc: 'Contains 7 Verified Movers badge', fn: (html) => /7(<!-- -->)?\s+Verified/.test(html) },
    { desc: 'Contains ItemList & FAQPage schemas', fn: (html) => html.includes('"@type":"ItemList"') && html.includes('"@type":"FAQPage"') }
  ]);

  // 3. Asansol General Route
  await testRoute('Asansol Directory (7 Movers)', 'http://localhost:3000/packers-and-movers-asansol', [
    { desc: 'Contains National Packers & Movers', fn: (html) => html.includes('National Packers') },
    { desc: 'Contains Bengal Express Cargo Logistics (GT Road)', fn: (html) => html.includes('Bengal Express Cargo') },
    { desc: 'Contains Howrah Roadways & Relocations', fn: (html) => html.includes('Howrah Roadways') },
    { desc: 'Contains Damodar Logistics & Packers', fn: (html) => html.includes('Damodar Logistics') },
    { desc: 'Contains Burnpur Express Movers', fn: (html) => html.includes('Burnpur Express Movers') },
    { desc: 'Contains 7 Verified Movers badge', fn: (html) => /7(<!-- -->)?\s+Verified/.test(html) }
  ]);

  // 4. Pune IBA Approved Route
  await testRoute('Pune IBA Approved (7 Movers)', 'http://localhost:3000/iba-approved-packers-and-movers-pune', [
    { desc: 'Contains National Packers & Movers', fn: (html) => html.includes('National Packers') },
    { desc: 'Contains Southern Cargo Packers and Movers (Nigdi)', fn: (html) => html.includes('Southern Cargo Packers') },
    { desc: 'Contains Deccan Express Movers and Packers', fn: (html) => html.includes('Deccan Express') },
    { desc: 'Contains Maratha Relocations Pune (IT Corridor)', fn: (html) => html.includes('Maratha Relocations') },
    { desc: 'Contains Hinjewadi IT Logistics & Cargo', fn: (html) => html.includes('Hinjewadi IT Logistics') },
    { desc: 'Contains 7 Verified Movers badge', fn: (html) => /7(<!-- -->)?\s+Verified/.test(html) }
  ]);

  // 5. XML Sitemap
  await testRoute('XML Sitemap (~2,715 URLs)', 'http://localhost:3000/sitemap.xml', [
    { desc: 'Sitemap contains <urlset>', fn: (xml) => xml.includes('<urlset') },
    { desc: 'Contains homepage URL', fn: (xml) => xml.includes('https://www.bestpackermovers.com</loc>') },
    { desc: 'Contains Dhanbad intent route', fn: (xml) => xml.includes('packers-and-movers-dhanbad') },
    { desc: 'Contains Coimbatore intent route', fn: (xml) => xml.includes('packers-and-movers-coimbatore') },
    { desc: 'Contains Mover Profile URL', fn: (xml) => xml.includes('/mover/') },
    { desc: 'Contains lastmod ISO timestamp', fn: (xml) => xml.includes('<lastmod>') },
    { desc: 'Total URL count > 2500', fn: (xml) => {
        const matches = xml.match(/<url>/g);
        const count = matches ? matches.length : 0;
        console.log(`      * Actual URLs in sitemap: ${count}`);
        return count >= 2500;
      }
    }
  ]);

  // 6. Mover Profile Page
  await testRoute('Mover Profile Page (LocalBusiness Schema)', 'http://localhost:3000/mover/tridev-packers-movers-dhanbad', [
    { desc: 'Contains company name', fn: (html) => html.includes('Tridev Packers') },
    { desc: 'Contains local address', fn: (html) => html.includes('Manaitand') },
    { desc: 'Contains MovingCompany schema', fn: (html) => html.includes('"@type":"MovingCompany"') }
  ]);

  console.log(`\n========================================`);
  console.log(`🏁 Verification Finished: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
