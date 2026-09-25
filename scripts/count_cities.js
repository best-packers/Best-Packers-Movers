const { query } = require('../lib/db');

async function stats() {
  const citiesCount = await query('SELECT COUNT(*) as total FROM cities');
  const statesCount = await query('SELECT COUNT(*) as total FROM states');
  const moversCount = await query('SELECT COUNT(*) as total FROM movers');
  const stateBreakdown = await query(
    `SELECT s.name as state, COUNT(c.id) as city_count 
     FROM states s 
     LEFT JOIN cities c ON c.state_id = s.id 
     GROUP BY s.id, s.name 
     ORDER BY city_count DESC, s.name ASC`
  );
  
  console.log('=== PLATFORM METRICS ===');
  console.log('Total Cities in Database:', citiesCount.rows[0].total);
  console.log('Total States / UTs:', statesCount.rows[0].total);
  console.log('Total Movers Listed:', moversCount.rows[0].total);
  console.log('\n=== CITIES PER STATE BREAKDOWN ===');
  console.table(stateBreakdown.rows);
  process.exit(0);
}

stats().catch(e => { console.error(e); process.exit(1); });
