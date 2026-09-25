const branches = require('./national_branches.json');
const { query } = require('../lib/db');

async function testMatch() {
  const cities = await query('SELECT c.id, c.name, c.slug, s.name as state_name, s.slug as state_slug FROM cities c JOIN states s ON c.state_id = s.id');
  let matched = [];
  let fallback = [];

  for (const c of cities.rows) {
    const directUrl = 'https://www.thenationalpackersmovers.com/branches/' + c.state_slug + '/' + c.slug;
    const directUrlNoHyphen = 'https://www.thenationalpackersmovers.com/branches/' + c.state_slug + '/' + c.slug.replace(/-/g, '');
    
    // Find matching branch
    const found = branches.find(b => 
      b.toLowerCase() === directUrl.toLowerCase() || 
      b.toLowerCase() === directUrlNoHyphen.toLowerCase() ||
      b.toLowerCase().endsWith('/' + c.slug.toLowerCase()) ||
      b.toLowerCase().endsWith('/' + c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    if (found) {
      matched.push({ city: c.name, state: c.state_name, slug: c.slug, branchUrl: found });
    } else {
      fallback.push({ city: c.name, state: c.state_name, slug: c.slug });
    }
  }

  console.log('✅ Matched City Branch Pages:', matched.length);
  console.log('ℹ️ Fallback to Homepage:', fallback.length);
  console.log('\nSample Matched Branches:');
  console.table(matched.slice(0, 15));
  console.log('\nSample Fallbacks:');
  console.table(fallback.slice(0, 10));
}

testMatch();
