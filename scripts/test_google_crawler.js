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

async function testEs5() {
  const url = 'https://www.google.com/maps/search/packers+and+movers+in+Dhanbad?hl=en&dg=es5';
  const res = await testFetch(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  });
  console.log('Status:', res.status, 'Length:', res.body.length);
  // Check if standard HTML place listings exist
  // In dg=es5 mode, Google Maps renders standard HTML!
  console.log('Has place-result or similar:', res.body.includes('place') || res.body.includes('result'));
  // Save snippet to analyze
  const fs = require('fs');
  fs.writeFileSync('scripts/maps_sample.html', res.body);
  console.log('Written maps_sample.html');
}

testEs5();
