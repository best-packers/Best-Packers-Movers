const fs = require('fs');

const html = fs.readFileSync('scripts/maps_sample.html', 'utf8');

// Look for place patterns in the HTML or scripts
// Google Maps embeds data in window.APP_INITIALIZATION_STATE = [...]
const appInitMatch = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[[\s\S]*?\]);\s*window/);
if (appInitMatch) {
  try {
    const raw = appInitMatch[1];
    // In Google Maps, nested arrays contain the search results
    // Let's search inside raw string for matches like ["Name", rating, reviewCount, [address...]]
    // Let's find all occurrences of strings ending in "Packers" or "Movers"
    const nameMatches = [...raw.matchAll(/\["([^"]+(?:Packers|Movers|Logistics|Relocation)[^"]*)"/gi)];
    console.log(`Found ${nameMatches.length} raw name matches:`);
    const unique = new Set();
    nameMatches.forEach(m => unique.add(m[1]));
    console.log(Array.from(unique));
  } catch (e) {
    console.error('Parse error:', e.message);
  }
} else {
  console.log('No APP_INITIALIZATION_STATE found');
}
