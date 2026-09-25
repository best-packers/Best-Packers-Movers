const { query } = require('../lib/db');

async function cleanupListings() {
  console.log('🧹 Purging all mock competitor listings from database...');
  try {
    // Check current count
    const totalBefore = await query('SELECT COUNT(*) as count FROM movers');
    console.log(`Current total movers in DB: ${totalBefore.rows[0].count}`);

    // Delete all movers where name does NOT start with 'National Packers' or rank_order != 1
    const delRes = await query(
      "DELETE FROM movers WHERE rank_order != 1 OR name NOT LIKE 'National Packers%'"
    );
    console.log(`Deleted non-National listings. Affected rows: ${delRes.rowCount || 'completed'}`);

    // Verify remaining
    const totalAfter = await query('SELECT COUNT(*) as count FROM movers');
    console.log(`Remaining movers in DB: ${totalAfter.rows[0].count} (All National Packers #1)`);

    // Verify sample
    const sample = await query('SELECT id, name, slug, rank_order FROM movers LIMIT 5');
    console.log('Sample remaining listings:', sample.rows);

    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanupListings();
