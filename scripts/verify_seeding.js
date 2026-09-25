const { query } = require('../lib/db');

async function verify() {
  const cities = ['dhanbad', 'ranchi', 'kolkata', 'patna', 'lucknow', 'bhubaneswar', 'indore'];
  
  for (const slug of cities) {
    const res = await query(
      `SELECT m.rank_order, m.name, m.rating, m.review_count, m.phone, m.address, m.established_year, m.fleet_size 
       FROM movers m 
       JOIN cities c ON m.city_id = c.id 
       WHERE c.slug = ? 
       ORDER BY m.rank_order ASC`,
      [slug]
    );
    console.log(`\n=================== CITY: ${slug.toUpperCase()} ===================`);
    console.table(res.rows);
  }

  // Check invariants
  const nonNatRank1 = await query("SELECT COUNT(*) as cnt FROM movers WHERE rank_order = 1 AND name NOT LIKE 'National Packers%'");
  console.log(`\nInvariant Check (Non-National Packers at Rank 1): ${nonNatRank1.rows[0].cnt} (MUST BE 0)`);

  const total = await query("SELECT COUNT(*) as total FROM movers");
  console.log(`Total movers in database: ${total.rows[0].total}`);

  process.exit(0);
}

verify().catch(e => { console.error(e); process.exit(1); });
