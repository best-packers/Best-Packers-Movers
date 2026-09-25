const http = require('http');
const fs = require('fs');
const path = require('path');

function getUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== VERIFYING RATE CARD & CALCULATOR DISCLAIMERS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Static component verification
  console.log('--- 1. Static Component Source Checks ---');
  const costEstimatorSrc = fs.readFileSync(path.join(__dirname, '../components/CostEstimator.jsx'), 'utf8');
  assert(
    costEstimatorSrc.includes('Indicative Estimate:') && costEstimatorSrc.includes('Final quotes vary based on physical inventory volume'),
    'CostEstimator.jsx has in-card Indicative Estimate micro-disclaimer'
  );
  assert(
    costEstimatorSrc.includes('Important Price Disclaimer ({cityName}):') && costEstimatorSrc.includes('Final shifting quotes are provided after a free, zero-obligation pre-move survey.'),
    'CostEstimator.jsx has full Important Price Disclaimer with dynamic {cityName}'
  );

  const moverProfileSrc = fs.readFileSync(path.join(__dirname, '../app/mover/[slug]/page.js'), 'utf8');
  assert(
    moverProfileSrc.includes('Important Price Disclaimer ({mover.city_name}):') && moverProfileSrc.includes('Final shifting quotes are provided after a free, zero-obligation pre-move survey.'),
    'app/mover/[slug]/page.js has full Important Price Disclaimer with dynamic {mover.city_name}'
  );

  const quoteModalSrc = fs.readFileSync(path.join(__dirname, '../components/QuoteModal.jsx'), 'utf8');
  assert(
    quoteModalSrc.includes('Rates shown online are estimates. Final quotation is locked after your free, zero-obligation pre-move survey.'),
    'QuoteModal.jsx has pre-move survey locking notice'
  );

  // 2. Live HTTP Rendering Checks
  console.log('\n--- 2. Live HTTP Rendering Checks ---');

  // Test Bokaro Steel City Calculator
  try {
    const bokaroRes = await getUrl('/packers-and-movers-bokaro-steel-city');
    assert(bokaroRes.status === 200, 'HTTP 200 on /packers-and-movers-bokaro-steel-city');
    assert(
      bokaroRes.body.includes('Important Price Disclaimer') &&
      bokaroRes.body.includes('Bokaro Steel City') &&
      bokaroRes.body.includes('Final shifting quotes are provided after a free, zero-obligation pre-move survey.'),
      'Bokaro Steel City page renders dynamic calculator disclaimer for Bokaro Steel City'
    );
    assert(
      bokaroRes.body.includes('Indicative Estimate:') &&
      bokaroRes.body.includes('Final quotes vary based on physical inventory volume'),
      'Bokaro calculator renders in-card Indicative Estimate note'
    );
  } catch (err) {
    assert(false, `Bokaro check error: ${err.message}`);
  }

  // Test Dhanbad Profile Rate Card
  try {
    const dhanbadProfileRes = await getUrl('/mover/national-packers-and-movers-dhanbad');
    assert(dhanbadProfileRes.status === 200, 'HTTP 200 on /mover/national-packers-and-movers-dhanbad');
    assert(
      dhanbadProfileRes.body.includes('Important Price Disclaimer') &&
      dhanbadProfileRes.body.includes('Dhanbad') &&
      dhanbadProfileRes.body.includes('Final shifting quotes are provided after a free, zero-obligation pre-move survey.'),
      'Dhanbad mover profile renders dynamic rate card disclaimer for Dhanbad'
    );
  } catch (err) {
    assert(false, `Dhanbad profile check error: ${err.message}`);
  }

  // Test Bokaro Steel City Profile Rate Card
  try {
    const bokaroProfileRes = await getUrl('/mover/national-packers-and-movers-bokaro-steel-city');
    assert(bokaroProfileRes.status === 200, 'HTTP 200 on /mover/national-packers-and-movers-bokaro-steel-city');
    assert(
      bokaroProfileRes.body.includes('Important Price Disclaimer') &&
      bokaroProfileRes.body.includes('Bokaro Steel City') &&
      bokaroProfileRes.body.includes('Final shifting quotes are provided after a free, zero-obligation pre-move survey.'),
      'Bokaro Steel City mover profile renders dynamic rate card disclaimer for Bokaro Steel City'
    );
  } catch (err) {
    assert(false, `Bokaro profile check error: ${err.message}`);
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

run();
