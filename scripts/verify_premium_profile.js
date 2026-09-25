const http = require('http');

function fetchHtml(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, html: data });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting Automated Premium Profile & Editorial Card Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  // 1. Profile Pages Verification
  const profiles = [
    {
      name: 'Dhanbad National Packers Profile',
      path: '/mover/national-packers-and-movers-dhanbad',
      expectedBranch: 'https://www.thenationalpackersmovers.com/branches/jharkhand/dhanbad',
      city: 'Dhanbad'
    },
    {
      name: 'Lucknow National Packers Profile',
      path: '/mover/national-packers-and-movers-lucknow',
      expectedBranch: 'https://www.thenationalpackersmovers.com/branches/uttar-pradesh/lucknow',
      city: 'Lucknow'
    },
    {
      name: 'Kolkata National Packers Profile',
      path: '/mover/national-packers-and-movers-kolkata',
      expectedBranch: 'https://www.thenationalpackersmovers.com/branches/west-bengal/kolkata',
      city: 'Kolkata'
    }
  ];

  for (const p of profiles) {
    try {
      console.log(`🔍 Checking Profile: ${p.name} (${p.path})`);
      const { status, html } = await fetchHtml(p.path);

      if (status !== 200) {
        console.error(`  ❌ HTTP Status Error: Expected 200, got ${status}`);
        failed++;
        continue;
      }

      // Check Wide Canvas Container
      if (!html.includes('max-w-7xl')) {
        console.error(`  ❌ Missing wide container class 'max-w-7xl'.`);
        failed++;
        continue;
      }

      // Check Justdial At-A-Glance Section
      if (!html.includes('Business Overview &amp; Compliance at a Glance') && !html.includes('Business Overview & Compliance at a Glance')) {
        console.error(`  ❌ Missing 'At a Glance' business matrix.`);
        failed++;
        continue;
      }

      // Check 24/7 Hours
      if (!html.includes('Open 24/7')) {
        console.error(`  ❌ Missing 'Open 24/7' badge.`);
        failed++;
        continue;
      }

      // Check Localities Section
      if (!html.includes('Operational Localities Served') || !html.includes(p.city)) {
        console.error(`  ❌ Missing Operational Localities Served section.`);
        failed++;
        continue;
      }

      // Check Justdial 5-Star Rating Breakdown
      if (!html.includes('5 Star') || !html.includes('91%')) {
        console.error(`  ❌ Missing Justdial 5-Star rating distribution bar.`);
        failed++;
        continue;
      }

      // Check Sticky Lead Sidebar
      if (!html.includes('Request Free Moving Estimate') || !html.includes('BestPackers Directory Guarantee')) {
        console.error(`  ❌ Missing Sticky Lead Generation Sidebar.`);
        failed++;
        continue;
      }

      // Check Do-Follow Official Website Branch Link
      if (!html.includes(p.expectedBranch)) {
        console.error(`  ❌ Missing Do-Follow Official Website link: ${p.expectedBranch}`);
        failed++;
        continue;
      }

      // Check Zero Nofollow on Official Link
      if (html.includes('rel="nofollow"') || html.includes('rel="sponsored"')) {
        console.error(`  ❌ Detected forbidden nofollow / sponsored tag on profile!`);
        failed++;
        continue;
      }

      console.log(`  ✅ PASSED: Wide Justdial layout, At-a-Glance, Localities, 5-Star breakdown, and Do-Follow branch link verified.`);
      passed++;
    } catch (err) {
      console.error(`  ❌ Test execution error on ${p.path}:`, err.message);
      failed++;
    }
  }

  // 2. City SERP Listing Card Verification
  console.log('\n🔍 Checking City SERP Listing Card (components/MoverCard.jsx)...');
  const serpCities = [
    { path: '/packers-and-movers-dhanbad', city: 'Dhanbad' },
    { path: '/packers-and-movers-lucknow', city: 'Lucknow' }
  ];

  for (const sc of serpCities) {
    try {
      const { status, html } = await fetchHtml(sc.path);

      if (status !== 200) {
        console.error(`  ❌ Failed SERP HTTP status: ${status}`);
        failed++;
        continue;
      }

      // Check Unbiased Editorial #1 Header Bar
      if (!html.includes('Ranked #1 in') || !html.includes('100% Audit Verified') || !html.includes(sc.city)) {
        console.error(`  ❌ Missing Editorial #1 header on ${sc.path}`);
        failed++;
        continue;
      }

      // Check 4-Pillar Credential Pills
      if (!html.includes('IBA Approved') || !html.includes('In-House Fleet') || !html.includes('4-Layer Armor') || !html.includes('Zero Hidden Fees')) {
        console.error(`  ❌ Missing 4-Pillar Trust Matrix on ${sc.path}`);
        failed++;
        continue;
      }

      // Check Competitor Lockout (Exactly 1 Website Button)
      const buttonMatches = (html.match(/Visit Official Website/g) || []).length;
      if (buttonMatches !== 1) {
        console.error(`  ❌ Competitor lockout failure: Expected 1 website button, found ${buttonMatches}`);
        failed++;
        continue;
      }

      console.log(`  ✅ PASSED: ${sc.city} SERP displays Editorial #1 Header, 4-Pillar Matrix, & Single Do-Follow Website CTA.`);
      passed++;
    } catch (err) {
      console.error(`  ❌ Test error on ${sc.path}:`, err.message);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 100% Justdial Profile & Editorial Card Upgrade Verified Successfully!\n');
  }
}

runTests();
