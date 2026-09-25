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

async function testNominatim() {
  const city = 'Dhanbad';
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent('logistics in ' + city)}&format=json&addressdetails=1&limit=10`;
  const res = await testFetch(url, { 'User-Agent': 'BestPackerMovers/1.0 (contact@bestpackermovers.com)' });
  console.log('Nominatim status:', res.status);
  try {
    const json = JSON.parse(res.body);
    console.log('Nominatim results:', json.map(j => ({ name: j.name || j.display_name, type: j.type })));
  } catch(e) {
    console.log('Error parsing nominatim:', e.message);
  }
}

async function testGoogleSuggest() {
  const city = 'Dhanbad';
  const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent('packers and movers in ' + city + ' ')}`;
  const res = await testFetch(url, { 'User-Agent': 'Mozilla/5.0' });
  console.log('Google Suggest status:', res.status);
  try {
    const json = JSON.parse(res.body);
    console.log('Google Suggestions for movers in Dhanbad:', json[1]);
  } catch (e) {
    console.log('Suggest parse error:', e.message);
  }
}

testNominatim();
testGoogleSuggest();
