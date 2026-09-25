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

async function testSearchExtract() {
  const city = 'Dhanbad';
  const query = `packers and movers in ${city}`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  const res = await testFetch(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  
  // Extract results: title, snippet, url
  const resultBlocks = [...res.body.matchAll(/<div class="result__body">([\s\S]*?)<\/div>\s*<\/div>/g)];
  console.log(`Found ${resultBlocks.length} result blocks on DDG`);
  
  const extracted = [];
  for (const block of resultBlocks) {
    const text = block[1];
    const titleMatch = text.match(/<a class="result__url"[^>]*>([\s\S]*?)<\/a>|<h2 class="result__title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
    const title = titleMatch ? (titleMatch[2] || titleMatch[1]).replace(/<[^>]+>/g, '').trim() : '';
    const snippetMatch = text.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    if (title && !title.toLowerCase().includes('justdial') && !title.toLowerCase().includes('sulekha')) {
      extracted.push({ title, snippet });
    }
  }
  
  console.log('Sample extracted clean movers:');
  extracted.slice(0, 8).forEach((item, idx) => {
    console.log(`\n[${idx + 1}] Title: ${item.title}`);
    console.log(`    Snippet: ${item.snippet}`);
  });
}

testSearchExtract();
