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

async function test() {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('packers and movers in Dhanbad')}`;
  const res = await testFetch(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  
  const titles = [...res.body.matchAll(/<h2 class="result__title">[\s\S]*?<a[^>]*class="result__url"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)];
  // Try matching links with class result__a
  const links = [...res.body.matchAll(/<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const snippets = [...res.body.matchAll(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  
  console.log(`Links found: ${links.length}, Snippets found: ${snippets.length}`);
  for (let i = 0; i < Math.min(links.length, 10); i++) {
    console.log(`\n[${i+1}] ${links[i]}`);
    console.log(`    ${snippets[i] || 'No snippet'}`);
  }
}

test();
