const { query } = require('../lib/db');
const fs = require('fs');

async function check() {
  const content = fs.readFileSync(__dirname + '/seed_authentic_pan_india.js', 'utf8');
  const statesRes = await query('SELECT name FROM states ORDER BY name ASC');
  const dbStates = statesRes.rows.map(r => r.name);
  console.log('Total states in DB:', dbStates.length);
  const missing = [];
  for (const st of dbStates) {
    if (!content.includes("'" + st + "': {")) {
      missing.push(st);
    }
  }
  console.log('Missing states count:', missing.length);
  console.log('Missing states list:', missing);
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
