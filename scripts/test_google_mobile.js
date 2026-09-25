const https = require('https');

async function testFetch(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function testMobileGoogle() {
  const query = 'packers and movers in Dhanbad';
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=in&num=20`;
  const res = await testFetch(url, {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
  });
  console.log('Mobile Google Status:', res.status, 'Length:', res.body.length);
  const fs = require('fs');
  fs.writeFileSync('scripts/google_mobile_sample.html', res.body);
  console.log('Written google_mobile_sample.html');
  
  // Look for business names in mobile Google
  const names = [...res.body.matchAll(/<div[^>]*class="[^"]*(?:BNeawe|rllt__details|deIvCb)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 3 && t.length < 80);
  console.log('Sample extracted strings:', names.slice(0, 15));
}

testMobileGoogle();
