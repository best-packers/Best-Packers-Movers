const knex = require('knex');

async function testKnex() {
  console.log('Testing Knex with explicit config vs connectionString...');
  
  const pgExplicit = knex({
    client: 'pg',
    connection: {
      host: 'db.gtbqvigqoggwlvpthsoe.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'BestPackerMovers9835',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 0, max: 5 }
  });

  try {
    const res = await pgExplicit.raw('SELECT count(*) as count FROM states');
    console.log('✅ Knex with explicit host connected successfully! States count:', res.rows[0].count);
    await pgExplicit.destroy();
  } catch (err) {
    console.error('❌ Knex explicit failed:', err.message);
  }
}

testKnex();
