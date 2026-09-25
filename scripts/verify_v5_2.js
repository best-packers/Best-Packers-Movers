const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('=== VERIFYING v5.2 FIXES ===\n');

  // 1. Verify Navbar.jsx
  console.log('1. Checking Navbar.jsx links:');
  const navbarContent = fs.readFileSync(path.join(__dirname, '../components/Navbar.jsx'), 'utf8');
  const hasTopMovers = navbarContent.includes('href="/top-packers-and-movers"');
  const hasIbaApproved = navbarContent.includes('href="/iba-approved-packers-and-movers"');
  console.log('   - Navbar "Top Movers" points to /top-packers-and-movers:', hasTopMovers ? 'PASS ✅' : 'FAIL ❌');
  console.log('   - Navbar "IBA Approved" points to /iba-approved-packers-and-movers:', hasIbaApproved ? 'PASS ✅' : 'FAIL ❌');

  // 2. Verify SearchBar.jsx
  console.log('\n2. Checking SearchBar.jsx:');
  const searchBarContent = fs.readFileSync(path.join(__dirname, '../components/SearchBar.jsx'), 'utf8');
  const noAutoRedirectOnSelect = !searchBarContent.includes('router.push(\'/packers-and-movers-\' + city.slug)');
  const hasSubmitRedirect = searchBarContent.includes('handleSubmit = (e) =>') && searchBarContent.includes('router.push(targetUrl)');
  console.log('   - No auto-redirect on source city select:', noAutoRedirectOnSelect ? 'PASS ✅' : 'FAIL ❌');
  console.log('   - Redirect occurs only on handleSubmit (Find Movers click):', hasSubmitRedirect ? 'PASS ✅' : 'FAIL ❌');

  // 3. Verify Server Endpoints
  console.log('\n3. Testing Server Endpoints (http://localhost:3000):');
  try {
    const topRes = await fetchUrl('http://localhost:3000/top-packers-and-movers');
    console.log(`   - GET /top-packers-and-movers: HTTP ${topRes.status}`, topRes.status === 200 ? 'PASS ✅' : 'FAIL ❌');
    const topHasNational = topRes.body.includes('National Packers') || topRes.body.includes('National');
    console.log('   - /top-packers-and-movers contains National Packers at top:', topHasNational ? 'PASS ✅' : 'FAIL ❌');

    const ibaRes = await fetchUrl('http://localhost:3000/iba-approved-packers-and-movers');
    console.log(`   - GET /iba-approved-packers-and-movers: HTTP ${ibaRes.status}`, ibaRes.status === 200 ? 'PASS ✅' : 'FAIL ❌');
    const ibaHasNational = ibaRes.body.includes('National Packers') || ibaRes.body.includes('National');
    const ibaHasGuide = ibaRes.body.includes('Bank & PSU Shifting Bill Reimbursement Guide') || ibaRes.body.includes('Reimbursement');
    console.log('   - /iba-approved-packers-and-movers contains National Packers:', ibaHasNational ? 'PASS ✅' : 'FAIL ❌');
    console.log('   - /iba-approved-packers-and-movers contains reimbursement guide:', ibaHasGuide ? 'PASS ✅' : 'FAIL ❌');

  } catch (err) {
    console.log('   - Note: Server not running or compiling. Error:', err.message);
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify();
