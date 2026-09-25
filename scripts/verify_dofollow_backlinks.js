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
  console.log('🧪 Starting Automated Do-Follow & Branch Deep-Link Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  const testCases = [
    {
      name: 'Dhanbad City SERP -> Direct Dhanbad Branch Page',
      path: '/packers-and-movers-dhanbad',
      expectedUrl: 'https://www.thenationalpackersmovers.com/branches/jharkhand/dhanbad',
    },
    {
      name: 'Lucknow City SERP -> Direct Lucknow Branch Page',
      path: '/packers-and-movers-lucknow',
      expectedUrl: 'https://www.thenationalpackersmovers.com/branches/uttar-pradesh/lucknow',
    },
    {
      name: 'Kolkata City SERP -> Direct Kolkata Branch Page',
      path: '/packers-and-movers-kolkata',
      expectedUrl: 'https://www.thenationalpackersmovers.com/branches/west-bengal/kolkata',
    },
    {
      name: 'Patna City SERP -> Direct Patna Branch Page',
      path: '/packers-and-movers-patna',
      expectedUrl: 'https://www.thenationalpackersmovers.com/branches/bihar/patna',
    },
    {
      name: 'Coimbatore City SERP -> Root Homepage Fallback',
      path: '/packers-and-movers-coimbatore',
      expectedUrl: 'https://www.thenationalpackersmovers.com/',
    },
    {
      name: 'Jharkhand State Hub -> Direct State Branch Page',
      path: '/jharkhand',
      expectedUrl: 'https://www.thenationalpackersmovers.com/branches/jharkhand',
    },
    {
      name: 'National Packers Dhanbad Profile -> Direct Branch Page',
      path: '/mover/national-packers-and-movers-dhanbad',
      expectedUrl: 'https://www.thenationalpackersmovers.com/branches/jharkhand/dhanbad',
    }
  ];

  for (const tc of testCases) {
    try {
      console.log(`🔍 Testing: ${tc.name} (${tc.path})`);
      const { status, html } = await fetchHtml(tc.path);

      if (status !== 200) {
        console.error(`  ❌ Failed HTTP status: Expected 200, got ${status}`);
        failed++;
        continue;
      }

      // Check for expected URL
      if (!html.includes(tc.expectedUrl)) {
        console.error(`  ❌ Missing expected branch/fallback URL: ${tc.expectedUrl}`);
        failed++;
        continue;
      }

      // Check for 'Visit Official Website'
      if (!html.includes('Visit Official Website')) {
        console.error(`  ❌ Missing 'Visit Official Website' CTA button text.`);
        failed++;
        continue;
      }

      // Check for rel="noopener"
      if (!html.includes('rel="noopener"')) {
        console.error(`  ❌ Missing rel="noopener" attribute.`);
        failed++;
        continue;
      }

      // Check strict absence of rel="nofollow"
      if (html.includes('rel="nofollow"') || html.includes('rel="sponsored"') || html.includes('rel="ugc"')) {
        console.error(`  ❌ Found forbidden nofollow / sponsored / ugc tag!`);
        failed++;
        continue;
      }

      // On city SERP with 7 listings, verify only National Packers gets the website button
      if (tc.path.startsWith('/packers-and-movers-')) {
        const buttonCount = (html.match(/Visit Official Website/g) || []).length;
        if (buttonCount !== 1) {
          console.error(`  ❌ Competitor lockout failure: Expected exactly 1 website button, found ${buttonCount}`);
          failed++;
          continue;
        }
        console.log(`  ✅ PASSED: Competitor Lockout Verified (Exactly 1 website button for National Packers, 0 for competitors #2-7).`);
      }

      console.log(`  ✅ PASSED: Correct Target URL -> ${tc.expectedUrl}`);
      console.log(`  ✅ PASSED: Strict Do-Follow rel="noopener" confirmed (0% nofollow).`);
      passed++;
    } catch (err) {
      console.error(`  ❌ Test execution error on ${tc.path}:`, err.message);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 100% Backlink Engine & Branch Deep-Linking Verified Successfully!\n');
  }
}

runTests();
