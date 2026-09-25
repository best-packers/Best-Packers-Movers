const http = require('http');
const { query } = require('../lib/db');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('🧪 Starting Automated Verification for BestPackerMovers.com (v5.1 Scope)...\n');
  let passed = 0;
  let total = 0;

  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // 1. Database Initial Listings Check
  try {
    const npCountRes = await query("SELECT COUNT(*) as count FROM movers WHERE name LIKE 'National Packers%'");
    assert('National Packers & Movers present in all 206 cities', Number(npCountRes.rows[0].count) >= 206);

    const nationalSlot1 = await query("SELECT COUNT(*) as count FROM movers WHERE rank_order = 1 AND name NOT LIKE 'National Packers%'");
    assert('National Packers holds Slot #1 exclusively in all cities', Number(nationalSlot1.rows[0].count) === 0);
  } catch (err) {
    assert('Database listings check', false, err.message);
  }

  // 2. Stealth Mode & Neutral Branding on Homepage
  try {
    const homeRes = await fetchUrl('http://localhost:3000/');
    assert('Homepage returns HTTP 200', homeRes.status === 200);

    const hasPartnershipText = homeRes.body.includes('Operated in partnership with National Packers');
    assert('Stealth Mode: No "Operated in partnership with National Packers" on homepage', !hasPartnershipText);

    const hasNationalDispatch = homeRes.body.includes('National Dispatch:');
    assert('Stealth Mode: No "National Dispatch" in Navbar', !hasNationalDispatch);

    const hasCentralDesk = homeRes.body.includes('Central Verification Desk');
    assert('Neutral Rebranding: "Central Verification Desk" rendered in footer', hasCentralDesk);

    const hasDirectoryHelpline = homeRes.body.includes('Directory Helpline: +91 98351 68368');
    assert('Neutral Rebranding: "Directory Helpline: +91 98351 68368" in Navbar', hasDirectoryHelpline);
  } catch (err) {
    assert('Homepage stealth verification', false, err.message);
  }

  // 3. SSR Profile Check for National Packers
  try {
    const npProfileRes = await fetchUrl('http://localhost:3000/mover/national-packers-and-movers-dhanbad');
    assert('National Packers Profile returns HTTP 200', npProfileRes.status === 200);
    assert('National Packers profile displays 1987 established year', npProfileRes.body.includes('1987'));
    assert('National Packers profile displays 45+ Container Trucks', npProfileRes.body.includes('45+ Container Trucks'));
    assert('National Packers profile displays IBA Approved badge', npProfileRes.body.includes('IBA Approved'));
  } catch (err) {
    assert('National Packers profile check', false, err.message);
  }

  // 4. Admin Profile Editor Route Check
  try {
    const moverRes = await query('SELECT id FROM movers LIMIT 1');
    const moverId = moverRes.rows[0].id;
    const editorRes = await fetchUrl(`http://localhost:3000/admin/movers/${moverId}`);
    assert('Admin Profile Editor returns HTTP 200', editorRes.status === 200);
    assert('Admin Profile Editor renders full editing suite', editorRes.body.includes('Basic Company Information') && editorRes.body.includes('Verified Shifting Rate Card'));
  } catch (err) {
    assert('Admin Profile Editor check', false, err.message);
  }

  console.log(`\n========================================`);
  console.log(`🎯 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
