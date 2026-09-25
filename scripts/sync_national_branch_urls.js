const fs = require('fs');
const path = require('path');
const { query } = require('../lib/db');

async function syncNationalBranchUrls() {
  console.log('🚀 Starting National Packers Branch URL Synchronization...');

  const branchesPath = path.join(__dirname, 'national_branches.json');
  if (!fs.existsSync(branchesPath)) {
    throw new Error('national_branches.json not found!');
  }
  const branches = JSON.parse(fs.readFileSync(branchesPath, 'utf8'));
  console.log(`📋 Loaded ${branches.length} verified branch URLs from thenationalpackersmovers.com`);

  // Fetch all cities with their state info
  const citiesRes = await query(`
    SELECT c.id as city_id, c.name as city_name, c.slug as city_slug, 
           s.name as state_name, s.slug as state_slug
    FROM cities c
    JOIN states s ON c.state_id = s.id
    ORDER BY c.name ASC
  `);

  console.log(`🏙️ Found ${citiesRes.rows.length} cities in database.`);

  // Ensure all competitors have clean empty website_url (no external links)
  await query('UPDATE movers SET website_url = \'\' WHERE rank_order > 1');

  let matchedCount = 0;
  let fallbackCount = 0;
  const updates = [];

  for (const c of citiesRes.rows) {
    const directUrl = `https://www.thenationalpackersmovers.com/branches/${c.state_slug}/${c.city_slug}`;
    const directUrlNoHyphen = `https://www.thenationalpackersmovers.com/branches/${c.state_slug}/${c.city_slug.replace(/-/g, '')}`;
    
    // Find matching branch
    const foundBranch = branches.find(b => {
      const lowerB = b.toLowerCase();
      return (
        lowerB === directUrl.toLowerCase() ||
        lowerB === directUrlNoHyphen.toLowerCase() ||
        lowerB.endsWith(`/${c.city_slug.toLowerCase()}`) ||
        lowerB.endsWith(`/${c.city_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`)
      );
    });

    const finalUrl = foundBranch ? foundBranch : 'https://www.thenationalpackersmovers.com/';

    if (foundBranch) {
      matchedCount++;
    } else {
      fallbackCount++;
    }

    // Update National Packers record strictly at rank_order = 1 for this city
    const updateRes = await query(`
      UPDATE movers 
      SET website_url = $1
      WHERE city_id = $2 AND rank_order = 1
    `, [finalUrl, c.city_id]);

    updates.push({
      city: c.city_name,
      state: c.state_name,
      url: finalUrl,
      isBranch: !!foundBranch
    });
  }

  console.log(`\n========================================`);
  console.log(`✅ Synchronization Complete!`);
  console.log(`🎯 Matched Dedicated City Branch Pages: ${matchedCount}`);
  console.log(`🌐 Fallback to Root Homepage: ${fallbackCount}`);
  console.log(`========================================\n`);

  // Print sample matches
  console.log('📌 Sample Matched City Branches:');
  console.table(updates.filter(u => u.isBranch).slice(0, 10));

  console.log('\n📌 Sample Homepage Fallbacks:');
  console.table(updates.filter(u => !u.isBranch).slice(0, 5));

  // Verify Dhanbad specifically
  const dhanbadCheck = updates.find(u => u.city.toLowerCase() === 'dhanbad');
  console.log('\n🔍 Dhanbad Specific Check:', dhanbadCheck);
}

syncNationalBranchUrls().catch(err => {
  console.error('❌ Error syncing branch URLs:', err);
  process.exit(1);
});
