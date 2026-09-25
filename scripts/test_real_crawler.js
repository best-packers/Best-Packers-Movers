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

function cleanCompanyName(raw, cityName) {
  let name = raw.replace(/<[^>]+>/g, '')
    .replace(/^(top|best|10|5|cheap|verified)\s+/i, '')
    .replace(/\s*-\s*(justdial|sulekha|nobroker|packersbazaar|quikr|magicbricks)[\s\S]*/i, '')
    .replace(/\s*\|\s*[\s\S]*/i, '')
    .replace(/\s*–\s*[\s\S]*/i, '')
    .replace(new RegExp(`in ${cityName}.*`, 'i'), '')
    .replace(new RegExp(`charges.*`, 'i'), '')
    .replace(new RegExp(`price.*`, 'i'), '')
    .replace(new RegExp(`contact number.*`, 'i'), '')
    .replace(new RegExp(`near me.*`, 'i'), '')
    .trim();

  // Capitalize properly
  name = name.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return name;
}

async function crawlRealCityMovers(cityName, stateName = '') {
  console.log(`\n🔍 Crawling real Google Search & Maps data for: ${cityName}, ${stateName}...`);

  const results = [];
  const seen = new Set();

  // 1. Google Live Entity Suggest
  try {
    const suggestQueries = [
      `packers and movers in ${cityName} `,
      `best packers and movers ${cityName} `,
      `top packers and movers in ${cityName} `
    ];

    for (const sq of suggestQueries) {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=chrome&hl=en&gl=in&q=${encodeURIComponent(sq)}`;
      const sRes = await testFetch(suggestUrl, { 'User-Agent': 'Mozilla/5.0' });
      if (sRes.status === 200) {
        const parsed = JSON.parse(sRes.body);
        const suggestions = parsed[1] || [];
        for (const s of suggestions) {
          // Check if this suggestion specifies a specific business brand
          const cleaned = cleanCompanyName(s, cityName);
          const lower = cleaned.toLowerCase();
          if (
            (lower.includes('packers') || lower.includes('movers')) &&
            cleaned.length >= 10 &&
            cleaned.length <= 50 &&
            !lower.includes('national packers') &&
            !seen.has(cleaned)
          ) {
            seen.add(cleaned);
            results.push({
              name: `${cleaned} (${cityName})`,
              rawName: cleaned,
              source: 'google_live_entity'
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Google Suggest error:', err.message);
  }

  // 2. DuckDuckGo Live SERP for Real Companies & Snippets
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"packers and movers in ${cityName}"`)}`;
    const ddgRes = await testFetch(ddgUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    if (ddgRes.status === 200) {
      const links = [...ddgRes.body.matchAll(/<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => m[1]);
      const snippets = [...ddgRes.body.matchAll(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => m[1]);

      for (let i = 0; i < links.length; i++) {
        const linkText = links[i];
        const snippetText = snippets[i] || '';
        const cleaned = cleanCompanyName(linkText, cityName);
        const lower = cleaned.toLowerCase();

        if (
          (lower.includes('packers') || lower.includes('movers') || lower.includes('relocation') || lower.includes('cargo')) &&
          cleaned.length >= 8 &&
          cleaned.length <= 55 &&
          !lower.includes('national packers') &&
          !lower.includes('directory') &&
          !lower.includes('portal') &&
          !seen.has(cleaned)
        ) {
          seen.add(cleaned);

          // Extract phone if snippet contains one
          const phoneMatch = snippetText.match(/(?:\+91[\s\-]?)?[6789]\d{9}/);
          const phone = phoneMatch ? phoneMatch[0] : null;

          results.push({
            name: `${cleaned} (${cityName})`,
            rawName: cleaned,
            snippet: snippetText.replace(/<[^>]+>/g, '').trim(),
            phone: phone,
            source: 'live_web_serp'
          });
        }
      }
    }
  } catch (err) {
    console.error('DDG SERP error:', err.message);
  }

  console.log(`\n✅ Total Real Mover Entities Discovered for ${cityName}: ${results.length}`);
  results.forEach((r, i) => {
    console.log(`[Rank #${i + 2}] ${r.name} | Phone: ${r.phone || 'Generated local branch'} | Source: ${r.source}`);
  });
  return results;
}

crawlRealCityMovers('Dhanbad', 'Jharkhand');
