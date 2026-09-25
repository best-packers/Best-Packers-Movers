async function test() {
  const routes = [
    { url: 'http://localhost:3000/packers-and-movers-bhubaneswar', expect: 'Bhubaneswar' },
    { url: 'http://localhost:3000/packers-and-movers-dhanbad', expect: 'Dhanbad' },
    { url: 'http://localhost:3000/packers-and-movers-kolkata', expect: 'Kolkata' },
    { url: 'http://localhost:3000/packers-and-movers-lucknow', expect: 'Lucknow' },
    { url: 'http://localhost:3000/packers-and-movers-patna', expect: 'Patna' },
    { url: 'http://localhost:3000/jharkhand', expect: 'Jharkhand' },
    { url: 'http://localhost:3000/odisha', expect: 'Odisha' },
    { url: 'http://localhost:3000/uttar-pradesh', expect: 'Uttar Pradesh' },
    { url: 'http://localhost:3000/mover/national-packers-and-movers-dhanbad', expect: 'National Packers' },
    { url: 'http://localhost:3000/top-packers-and-movers', expect: 'Top Verified Packers' },
    { url: 'http://localhost:3000/iba-approved-packers-and-movers', expect: 'IBA Approved' },
  ];

  let passed = 0;
  for (const r of routes) {
    try {
      const res = await fetch(r.url);
      const text = await res.text();
      const is200 = res.status === 200;
      const hasText = text.includes(r.expect);
      const has404 = text.includes('404 - Page Not Found') && !text.includes('Best Packers');
      if (is200 && hasText && !has404) {
        console.log(`✅ PASS: ${r.url} -> HTTP 200 (Contains "${r.expect}")`);
        passed++;
      } else {
        console.error(`❌ FAIL: ${r.url} -> Status ${res.status}, hasText: ${hasText}, has404: ${has404}`);
      }
    } catch (err) {
      console.error(`❌ ERROR: ${r.url} -> ${err.message}`);
    }
  }

  console.log(`\nFinal Score: ${passed}/${routes.length} (${Math.round((passed / routes.length) * 100)}%)`);
  process.exit(passed === routes.length ? 0 : 1);
}

test();
