const http = require('http');

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('  TESTING ADMIN STEALTH & CREDENTIALS SECURITY GATE  ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // 1. Check Homepage for /admin stealth
  const homeRes = await request('http://localhost:3000/');
  assert(homeRes.status === 200, 'Homepage returns HTTP 200');
  assert(!homeRes.body.includes('href="/admin"'), 'Homepage contains zero links to /admin (Stealth Verified)');
  assert(!homeRes.body.includes('Admin Portal') && !homeRes.body.includes('Admin Login'), 'Homepage has no Admin Portal or Admin Login text');

  // 2. Check City Directory for /admin stealth
  const cityRes = await request('http://localhost:3000/packers-and-movers-dhanbad');
  assert(cityRes.status === 200, 'City Directory returns HTTP 200');
  assert(!cityRes.body.includes('href="/admin"'), 'City Directory contains zero links to /admin (Stealth Verified)');

  // 3. Unauthenticated GET /admin
  const adminUnauthRes = await request('http://localhost:3000/admin');
  assert(adminUnauthRes.status === 200, 'GET /admin returns HTTP 200');
  assert(
    adminUnauthRes.body.includes('Restricted Command Center') || adminUnauthRes.body.includes('Unlock Command Center'),
    'Unauthenticated GET /admin displays the restricted AdminLoginGate'
  );
  assert(
    !adminUnauthRes.body.includes('Overview Dashboard') && !adminUnauthRes.body.includes('Live Google Maps Crawler'),
    'Unauthenticated GET /admin hides all admin dashboard data and tools'
  );

  // 4. Test API Auth with Wrong Credentials
  const badAuthRes = await request('http://localhost:3000/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'admin', password: 'wrongpassword' }),
  });
  assert(badAuthRes.status === 401, 'POST /api/admin/auth with bad password returns HTTP 401 Unauthorized');

  // 5. Test API Auth with Correct Credentials ('admin' / 'debabrata74618')
  const goodAuthRes = await request('http://localhost:3000/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'admin', password: 'debabrata74618' }),
  });
  assert(goodAuthRes.status === 200, 'POST /api/admin/auth with admin/debabrata74618 returns HTTP 200 OK');

  const setCookie = goodAuthRes.headers['set-cookie'];
  assert(setCookie && setCookie.some((c) => c.includes('bpm_admin_session')), 'Response sets secure bpm_admin_session cookie');

  const cookieHeader = setCookie ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';

  // 6. Authenticated GET /admin with Session Cookie
  const adminAuthRes = await request('http://localhost:3000/admin', {
    headers: { Cookie: cookieHeader },
  });
  assert(adminAuthRes.status === 200, 'GET /admin with auth cookie returns HTTP 200');
  assert(
    adminAuthRes.body.includes('Admin') && adminAuthRes.body.includes('Omnipotence'),
    'Authenticated GET /admin displays full Admin Omnipotence layout'
  );
  assert(
    adminAuthRes.body.includes('Live Google Maps Crawler'),
    'Authenticated GET /admin unlocks Crawler and Management tools'
  );
  assert(
    adminAuthRes.body.includes('Lock &amp; Log Out') || adminAuthRes.body.includes('Lock & Log Out'),
    'Authenticated layout includes session termination Log Out button'
  );

  // 7. Test Logout API
  const logoutRes = await request('http://localhost:3000/api/admin/auth', {
    method: 'DELETE',
    headers: { Cookie: cookieHeader },
  });
  assert(logoutRes.status === 200, 'DELETE /api/admin/auth returns HTTP 200 Logged Out');

  console.log(`\nResults: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%).`);
  process.exit(passed === total ? 0 : 1);
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
