const http = require('http');
const app = require('../api/index');
const { initDb } = require('../config/db');

async function testAdmin() {
  console.log('=== TESTING ADMIN ROUTES ===');
  await initDb();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // 1. Get login page
  const loginRes = await fetch(`${baseUrl}/admin/login`);
  console.log(`GET /admin/login status: ${loginRes.status}`);

  // 2. Perform login post
  const formBody = new URLSearchParams();
  formBody.append('password', 'admin1234');
  const postRes = await fetch(`${baseUrl}/admin/login`, {
    method: 'POST',
    body: formBody,
    redirect: 'manual'
  });
  console.log(`POST /admin/login status: ${postRes.status}, Location: ${postRes.headers.get('location')}`);
  const cookie = postRes.headers.get('set-cookie');

  // Helper with session cookie
  async function testAuthRoute(path) {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Cookie': cookie || '' }
    });
    console.log(`GET ${path} -> Status: ${res.status}`);
    if (res.status !== 200) {
      const txt = await res.text();
      console.error(`Error details on ${path}:`, txt.slice(0, 300));
      return false;
    }
    return true;
  }

  const routes = [
    '/admin',
    '/admin/leads',
    '/admin/vendors',
    '/admin/reviews',
    '/admin/users',
    '/admin/traffic',
    '/admin/media',
    '/admin/gallery',
    '/admin/blogs',
    '/admin/seo',
    '/admin/scraper',
    '/admin/settings'
  ];

  let allPassed = true;
  for (const r of routes) {
    const ok = await testAuthRoute(r);
    if (!ok) allPassed = false;
  }

  server.close();

  if (allPassed) {
    console.log('\n✅ ALL ADMIN ROUTES PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ Some admin routes failed.');
    process.exit(1);
  }
}

testAdmin().catch(e => {
  console.error('Fatal admin test error:', e);
  process.exit(1);
});
