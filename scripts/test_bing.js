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

async function testBing() {
  const query = 'packers and movers in Dhanbad';
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=in&setlang=en`;
  console.log('Testing Bing:', url);
  const res = await testFetch(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-IN,en;q=0.9',
  });
  console.log('Bing Status:', res.status, 'Body length:', res.body.length);
  
  // Check for local pack or place entities in Bing (e.g. class "l_crd", "b_entityTitle", "b_algo")
  const algoTitles = [...res.body.matchAll(/<li class="b_algo">[\s\S]*?<h2><a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Bing Algo Titles:', algoTitles);

  // Look for business listing cards (Bing Local Pack)
  const localCards = [...res.body.matchAll(/class="[^"]*(?:b_entityTitle|cpt_title|lc_title|fact_title)[^"]*"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Bing Local Cards:', localCards);
}

testBing();
