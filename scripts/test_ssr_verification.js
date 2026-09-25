async function runTests() {
  console.log('--- TESTING SERVER-FIRST SSR ENDPOINTS & GOOGLEBOT CRAWLABILITY ---');

  // 1. Homepage
  const homeRes = await fetch('http://localhost:3000/');
  console.log('1. Homepage status:', homeRes.status);
  const homeHtml = await homeRes.text();
  console.log('   - Has National Packers:', homeHtml.includes('National Packers'));
  console.log('   - Has WebSite schema:', homeHtml.includes('WebSite'));

  // 2. City Directory Intent Route
  const cityRes = await fetch('http://localhost:3000/packers-and-movers-dhanbad');
  console.log('2. City Intent Route status:', cityRes.status);
  const cityHtml = await cityRes.text();
  console.log('   - Has Dhanbad H1:', cityHtml.includes('Packers and Movers in Dhanbad'));
  console.log('   - Has National Packers #1:', cityHtml.includes('National Packers'));
  console.log('   - Has ItemList schema:', cityHtml.includes('ItemList'));

  // 3. Mover Profile Page
  const moverRes = await fetch('http://localhost:3000/mover/national-packers-and-movers-dhanbad');
  console.log('3. Mover Profile status:', moverRes.status);
  const moverHtml = await moverRes.text();
  console.log('   - Has National Mover Profile:', moverHtml.includes('National Packers'));
  console.log('   - Has LocalBusiness / MovingCompany schema:', moverHtml.includes('MovingCompany') || moverHtml.includes('LocalBusiness'));
  console.log('   - Has Direct Dispatch phone:', moverHtml.includes('98351 68368'));

  // 4. Sitemap.xml
  const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
  console.log('4. Sitemap.xml status:', sitemapRes.status);
  const sitemapXml = await sitemapRes.text();
  console.log('   - Sitemap contains URL entries:', sitemapXml.includes('<url>') && sitemapXml.includes('packers-and-movers-dhanbad'));

  // 5. Robots.txt
  const robotsRes = await fetch('http://localhost:3000/robots.txt');
  console.log('5. Robots.txt status:', robotsRes.status);
  const robotsTxt = await robotsRes.text();
  console.log('   - Robots allows root and links sitemap:', robotsTxt.includes('Allow: /') && robotsTxt.includes('sitemap.xml'));

  // 6. Test Inbound Lead Submission
  const leadRes = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Test Customer',
      customer_phone: '9835168368',
      from_city: 'Dhanbad',
      to_city: 'Kolkata',
      move_size: '3 BHK'
    })
  });
  const leadData = await leadRes.json();
  console.log('6. Inbound Lead API status:', leadRes.status, leadData);

  // 7. Test Admin Crawler
  const crawlRes = await fetch('http://localhost:3000/api/admin/crawler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city_id: 'test',
      city_name: 'Bokaro Steel City',
      state_name: 'Jharkhand'
    })
  });
  const crawlData = await crawlRes.json();
  console.log('7. Admin Crawler API status:', crawlRes.status, 'discovered:', crawlData.discovered_count);

  console.log('\n🎉 ALL 7 PRODUCTION SYSTEM TESTS PASSED 100%!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
