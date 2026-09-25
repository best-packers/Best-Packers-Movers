const { query } = require('../lib/db');

async function purgeJunk() {
  const res = await query("DELETE FROM movers WHERE source = 'google_crawler'");
  console.log('Purged junk crawler entries:', res.rowCount || 'completed');
  const counts = await query("SELECT source, COUNT(*) as cnt FROM movers GROUP BY source");
  console.table(counts.rows);
  process.exit(0);
}

purgeJunk().catch(err => {
  console.error(err);
  process.exit(1);
});
